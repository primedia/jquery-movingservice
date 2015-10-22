(function() {
  define('moving-form',["jquery"], function($) {
    var load_cities, load_cities_and_zips, load_zips, parse_and_inject_results, setup_bindings, state_code_from_name;
    setup_bindings = function() {
      $("select#moving_lead_MovingFrom_state").bind("change uiChange", function() {
        load_cities($("select#moving_lead_MovingFrom_state").val(), $("select#moving_lead_MovingFrom_city"));
      }).trigger("uiChange");
      $("select#moving_lead_MovingTo_state").bind("change uiChange", function() {
        load_cities($("select#moving_lead_MovingTo_state").val(), $("select#moving_lead_MovingTo_city"));
      }).trigger("uiChange");
      $("select#moving_lead_MovingTo_city").bind("change uiChange", function() {
        load_zips($("select#moving_lead_MovingTo_city").val(), $("select#moving_lead_MovingTo_state").val(), $("select#moving_lead_MovingTo_zip"));
      }).trigger("uiChange");
      $("select#moving_lead_MovingFrom_city").bind("change uiChange", function() {
        load_zips($("select#moving_lead_MovingFrom_city").val(), $("select#moving_lead_MovingFrom_state").val(), $("select#moving_lead_MovingFrom_zip"));
      }).trigger("uiChange");
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
      $(document).trigger('uiMovingFormSelectsUpdated', [target]);
    };
    state_code_from_name = function(name) {
      return $("select#moving_lead_MovingTo_state").find("option").filter(function() {
        return (new RegExp("^" + name + "$")).test($(this).text());
      }).attr("value");
    };
    $.fn.movingService = function(options) {
      var buildNewUrl, defaults, defineTemplate, formLoad, form_div, opts, submitLead, thankYou, updateForm;
      form_div = $(this);
      formLoad = function() {
        var url;
        $(document).trigger('uiMovingFormLoadStart');
        url = buildNewUrl(opts.form_params);
        url += defineTemplate(opts.template_param);
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
      defineTemplate = function(params) {
        if (params.template != null) {
          return "&template=" + params.template;
        } else {
          return "";
        }
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
            $(document).trigger('uiMovingFormSubmitted');
            opts.lead_saved();
          },
          error: function(req, status, err) {
            var parent;
            $(document).trigger('uiMovingFormLoadStart');
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

(function() {
  define('jquery-moving-service',["jquery", "jquery-ui", "moving-form", "jquery-maskedinput"], function($, ui, movingForm, mask) {
    return $.fn.getLeadForm = function(input_button, options) {
      var err, error, lead_form, moving_service_error;
      if (options == null) {
        options = {};
      }
      try {
        lead_form = $(this);
        return $(this).movingService({
          update_form: function() {
            var city, city_from_selector, city_to_selector, referrer, segments, state, state_from_selector, state_to_selector;
            lead_form.removeClass("loading");
            state_from_selector = $("select#moving_lead_MovingFrom_state");
            city_from_selector = $("select#moving_lead_MovingFrom_city");
            state_to_selector = $("select#moving_lead_MovingTo_state");
            city_to_selector = $("select#moving_lead_MovingTo_city");
            referrer = document.referrer;
            if (/(www|local)\.(\w+\.)?apartmentguide\.com/.test(referrer) && lead_form.find(".field_error").length === 0) {
              segments = referrer.split("/");
              state = (segments[4] + "").replace("-", " ");
              city = (segments[5] + "").replace("-", " ");
              if (!state_to_selector.val()) {
                state_to_selector.find("option").filter(function() {
                  return (new RegExp("^" + state + "$")).test($(this).text());
                }).attr({
                  selected: true
                });
              }
              if (!city_to_selector.val()) {
                movingForm.load_cities_and_zips(city, state, $("#moving_to_row"));
              }
            } else {
              state_from_selector.trigger('uiChange');
              state_to_selector.trigger('uiChange');
              city_from_selector.trigger('uiChange');
              city_to_selector.trigger('uiChange');
              $("#moving_lead_MovingDate").datepicker({
                minDate: "+2w",
                maxDate: "+6m",
                dateFormat: "mm-dd-yy"
              });
              $("#moving_lead_DayPhone").unmask().mask("(999) 999-9999");
              $("#moving_lead_EvePhone").unmask().mask("(999) 999-9999");
            }
            $(".form_button_box input").val("Get Moving Quotes!");
            $(".form_button_box input").addClass("button");
            $(document).trigger('uiMovingFormUpdated');
          },
          form_params: {
            MovingTo_state: $(this).attr("data-state"),
            MovingTo_city: $(this).attr("data-city"),
            MovingTo_zip: $(this).attr("data-zip"),
            Sid: options.SID,
            LeadSource: options.LeadSource
          },
          template_param: {
            template: $(this).attr("data-template")
          },
          lead_saved: function() {
            return lead_form.load("/v1/moving_lead/thankyou", "", function() {
              $(document).trigger('uiMovingFormSaved');
              if (lead_form.parent().attr("id") === "inline_leadform") {
                $("#inline_leadform h4").hide();
                $("#form_title").hide();
              }
              if ($(".back_to_search_link>a.back_to_results").length > 0) {
                $.get("http://ad.doubleclick.net/clk;240178453;63013666;e?");
              } else {
                $.get("http://ad.doubleclick.net/clk;240178454;63013666;f?");
              }
              return $("#moving_lead_form").append("<IMG SRC='http://ad.doubleclick.net/activity;src=2694165;type=ReloCV;cat=LeadCV;ord=" + Math.random() * 10000000000000 + "?' WIDTH=1 HEIGHT=1 BORDER=0>");
            });
          },
          error: function(res) {
            alert(res);
          }
        });
      } catch (error) {
        err = error;
        alert(err);
        return moving_service_error = function() {
          return $("#ready_to_move .moving_form").hide();
        };
      }
    };
  });

}).call(this);

