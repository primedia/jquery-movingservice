(function() {
  define(["jquery", "jquery-ui", "moving-form", "jquery-maskedinput"], function($, ui, movingForm, mask) {
    return $.fn.getLeadForm = function(input_button, options) {
      var err, lead_form, moving_service_error;
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
              state_from_selector.change();
              state_to_selector.change();
              city_from_selector.change();
              city_to_selector.change();
              $("#moving_lead_MovingDate").datepicker({
                minDate: +3,
                maxDate: "+6M",
                dateFormat: "mm/dd/yy"
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
          lead_saved: function() {
            return lead_form.load("/v1/moving_lead/thankyou", "", function() {
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
      } catch (_error) {
        err = _error;
        alert(err);
        return moving_service_error = function() {
          return $("#ready_to_move .moving_form").hide();
        };
      }
    };
  });

}).call(this);
