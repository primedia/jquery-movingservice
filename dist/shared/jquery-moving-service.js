(function() {
  define(["jquery", "moving-form", "jquery-maskedinput", "pikaday"], function($, movingForm, mask, Pikaday) {
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
            this.setup_date_picker();
            $("#moving_lead_DayPhone").unmask().mask("(999) 999-9999");
            $("#moving_lead_EvePhone").unmask().mask("(999) 999-9999");
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
            }
            $(".form_button_box input").val("Get Moving Quotes!");
            $(".form_button_box input").addClass("button");
            $(document).trigger('uiMovingFormUpdated');
          },
          setup_date_picker: function() {
            var today;
            today = new Date;
            return new Pikaday({
              field: $('#moving_lead_MovingDate')[0],
              format: 'MM-DD-YYYY',
              minDate: new Date(+(new Date) + 12096e5),
              maxDate: new Date(new Date(today).setMonth(today.getMonth() + 6))
            });
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
