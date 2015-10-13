define [
  "jquery",
  "jquery-ui",
  "moving-form",
  "jquery-maskedinput"
], ($, ui, movingForm, mask) ->
  # sid may be undefined or null (will default to AG's SID value server-side)
  $.fn.getLeadForm = (input_button, options={}) -> #TODO: I SHOULD NOT BE A PLUGIN -BNS
    try
      lead_form = $(this)
      $(this).movingService
        update_form: ->
          lead_form.removeClass "loading"
          state_from_selector = $("select#moving_lead_MovingFrom_state")
          city_from_selector = $("select#moving_lead_MovingFrom_city")
          state_to_selector = $("select#moving_lead_MovingTo_state")
          city_to_selector = $("select#moving_lead_MovingTo_city")

          # Populate the 'to' location if the referer has a city/state from an AG url
          referrer = document.referrer

          # search page, details page, thank you page
          if /(www|local)\.(\w+\.)?apartmentguide\.com/.test(referrer) and lead_form.find(".field_error").length is 0
            segments = referrer.split("/")
            state = (segments[4] + "").replace("-", " ")
            city = (segments[5] + "").replace("-", " ")
            unless state_to_selector.val()
              state_to_selector.find("option").filter(->
                (new RegExp("^" + state + "$")).test $(this).text()
              ).attr selected: true
            movingForm.load_cities_and_zips city, state, $("#moving_to_row")  unless city_to_selector.val()
          else
            state_from_selector.change()
            state_to_selector.change()
            city_from_selector.change()
            city_to_selector.change()
            $("#moving_lead_MovingDate").datepicker
              minDate: "+2w"
              maxDate: "+6m"
              dateFormat: "mm-dd-yy"

            $("#moving_lead_DayPhone").unmask().mask "(999) 999-9999"
            $("#moving_lead_EvePhone").unmask().mask "(999) 999-9999"

          $(".form_button_box input").val "Get Moving Quotes!"
          $(".form_button_box input").addClass "button"
          $(document).trigger 'uiMovingFormUpdated'
          return

        form_params:
          MovingTo_state: $(this).attr("data-state")
          MovingTo_city: $(this).attr("data-city")
          MovingTo_zip: $(this).attr("data-zip")
          Sid: options.SID
          LeadSource: options.LeadSource

        template_param:
          template: $(this).attr("data-template")

        lead_saved: ->
          lead_form.load "/v1/moving_lead/thankyou", "", ->
            $(document).trigger('uiMovingFormSaved')
            if lead_form.parent().attr("id") is "inline_leadform"
              $("#inline_leadform h4").hide()
              $("#form_title").hide()

            # Handle DART based on the current page.
            if $(".back_to_search_link>a.back_to_results").length > 0
              $.get "http://ad.doubleclick.net/clk;240178453;63013666;e?"
            else
              $.get "http://ad.doubleclick.net/clk;240178454;63013666;f?"
            $("#moving_lead_form").append "<IMG SRC='http://ad.doubleclick.net/activity;src=2694165;type=ReloCV;cat=LeadCV;ord=" + Math.random() * 10000000000000 + "?' WIDTH=1 HEIGHT=1 BORDER=0>"
        error: (res) ->
          alert res
          return

    catch err
      alert err
      moving_service_error = ->
        $("#ready_to_move .moving_form").hide()
