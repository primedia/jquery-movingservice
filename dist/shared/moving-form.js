(function() {
  define(["jquery"], function($) {
    var load_cities, load_cities_and_zips, load_zips, parse_and_inject_results, setup_bindings, state_code_from_name;
    setup_bindings = function() {
      $("select#moving_lead_MovingFrom_state").bind("change", function() {
        load_cities($("select#moving_lead_MovingFrom_state").val(), $("select#moving_lead_MovingFrom_city"));
      }).trigger("change");
      $("select#moving_lead_MovingTo_state").bind("change", function() {
        load_cities($("select#moving_lead_MovingTo_state").val(), $("select#moving_lead_MovingTo_city"));
      }).trigger("change");
      $("select#moving_lead_MovingTo_city").bind("change", function() {
        load_zips($("select#moving_lead_MovingTo_city").val(), $("select#moving_lead_MovingTo_state").val(), $("select#moving_lead_MovingTo_zip"));
      }).trigger("change");
      $("select#moving_lead_MovingFrom_city").bind("change", function() {
        load_zips($("select#moving_lead_MovingFrom_city").val(), $("select#moving_lead_MovingFrom_state").val(), $("select#moving_lead_MovingFrom_zip"));
      }).trigger("change");
    };
    load_cities = function(state, target, callback) {
      var current_city;
      if (state) {
        current_city = target.val();
        $.getJSON("/v1/moving_lead/get_cities/" + escape(state), function(json) {
          parse_and_inject_results(json, target, current_city);
          if (callback) {
            callback();
          }
        });
      }
    };
    load_zips = function(city, state, target) {
      var current_zip;
      if (city) {
        current_zip = target.val();
        $.getJSON("/v1/moving_lead/get_zipcodes/" + escape(state) + "/" + escape(city), function(json) {
          parse_and_inject_results(json, target, current_zip);
        });
      }
    };
    load_cities_and_zips = function(city, state, target) {
      var city_select, state_code;
      city_select = target.find("label:contains('City')").next();
      state_code = state_code_from_name(state);
      if (city) {
        load_cities(state_code, city_select, function() {
          city_select.val(city);
          load_zips(city, state_code, target.find("label:contains('Zip')").next());
        });
      } else {
        load_cities(state_code, city_select);
      }
    };
    parse_and_inject_results = function(json, target, current) {
      var data, html, i, len, selected;
      data = json;
      html = ["<option value=\"\">Please select</option>"];
      selected = void 0;
      current = current && current.toLowerCase().replace(" ", "");
      i = 0;
      len = data.length;
      while (i < len) {
        selected = (data[i].toLowerCase().replace(" ", "") === current ? " selected=\"selected\" " : "");
        html.push("<option value=\"" + data[i] + "\" " + selected + ">" + data[i] + "</option>");
        i++;
      }
      target.html(html.join(""));
      $(document).trigger('uiMovingFormSelectsUpdated');
    };
    state_code_from_name = function(name) {
      return $("select#moving_lead_MovingTo_state").find("option").filter(function() {
        return (new RegExp("^" + name + "$")).test($(this).text());
      }).attr("value");
    };
    $.fn.movingService = function(options) {
      var buildNewUrl, defaults, formLoad, form_div, opts, submitLead, thankYou, updateForm;
      form_div = $(this);
      formLoad = function() {
        var url;
        url = buildNewUrl(opts.form_params);
        form_div.load(url, function() {
          opts.update_form();
          $(".moving_form", form_div).submit(submitLead);
          setup_bindings();
          form_div.show();
          $(document).trigger('uiMovingFormShown');
        });
      };
      buildNewUrl = function(params) {
        var attr, base, i, uri;
        base = "/v1/moving_lead/new?";
        uri = "";
        for (i in params.required_fields) {
          uri += "moving_lead[required_fields][]=" + params.required_fields[i] + "&";
        }
        delete params.required_fields;
        for (attr in params) {
          if (params[attr]) {
            uri += "moving_lead[" + attr + "]=" + params[attr] + "&";
          }
        }
        uri = uri.substring(0, uri.length - 1);
        base += encodeURI(uri);
        return base;
      };
      submitLead = function() {
        var caller;
        caller = $(this);
        if (this.beenSubmitted) {
          return false;
        }
        this.beenSubmitted = true;
        $.ajax({
          url: "/v1/moving_lead/ajax.js",
          type: "POST",
          data: $(this).serialize(),
          success: function(response) {
            opts.lead_saved();
          },
          error: function(req, status, err) {
            var parent;
            parent = caller.parent();
            caller.replaceWith(req.responseText);
            opts.update_form();
            setup_bindings();
            $(".moving_form", parent).submit(submitLead);
            return false;
          }
        });
        return false;
      };
      thankYou = function() {
        form_div.html("Thank you!");
      };
      updateForm = function() {};
      defaults = {
        update_form: updateForm,
        lead_saved: thankYou
      };
      opts = jQuery.extend(defaults, options);
      return form_div.each(function() {
        formLoad();
      });
    };
    return {
      load_cities_and_zips: load_cities_and_zips,
      load_cities: load_cities,
      load_zips: load_zips
    };
  });

}).call(this);
