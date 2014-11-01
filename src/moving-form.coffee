define ["jquery"], ($) ->
  setup_bindings = ->
    $("select#moving_lead_MovingFrom_state").bind("change", ->
      load_cities $("select#moving_lead_MovingFrom_state").val(), $("select#moving_lead_MovingFrom_city")
      return
    ).trigger "change"
    $("select#moving_lead_MovingTo_state").bind("change", ->
      load_cities $("select#moving_lead_MovingTo_state").val(), $("select#moving_lead_MovingTo_city")
      return
    ).trigger "change"
    $("select#moving_lead_MovingTo_city").bind("change", ->
      load_zips $("select#moving_lead_MovingTo_city").val(), $("select#moving_lead_MovingTo_state").val(), $("select#moving_lead_MovingTo_zip")
      return
    ).trigger "change"
    $("select#moving_lead_MovingFrom_city").bind("change", ->
      load_zips $("select#moving_lead_MovingFrom_city").val(), $("select#moving_lead_MovingFrom_state").val(), $("select#moving_lead_MovingFrom_zip")
      return
    ).trigger "change"
    return
  load_cities = (state, target, callback) ->
    if state

      # get the selected value
      current_city = target.val()
      $.getJSON "/v1/moving_lead/get_cities/" + escape(state), (json) ->
        parse_and_inject_results json, target, current_city
        callback()  if callback
        return

    return
  load_zips = (city, state, target) ->
    if city
      current_zip = target.val()
      $.getJSON "/v1/moving_lead/get_zipcodes/" + escape(state) + "/" + escape(city), (json) ->
        parse_and_inject_results json, target, current_zip
        return

    return
  load_cities_and_zips = (city, state, target) ->
    city_select = target.find("label:contains('City')").next()
    state_code = state_code_from_name(state)
    if city
      load_cities state_code, city_select, ->
        city_select.val city
        load_zips city, state_code, target.find("label:contains('Zip')").next()
        return

    else
      load_cities state_code, city_select
    return
  parse_and_inject_results = (json, target, current) ->
    data = json
    html = ["<option value=\"\">Please select</option>"]
    selected = undefined
    current = current and current.toLowerCase().replace(" ", "")
    i = 0
    len = data.length

    while i < len
      selected = ((if data[i].toLowerCase().replace(" ", "") is current then " selected=\"selected\" " else ""))
      html.push "<option value=\"" + data[i] + "\" " + selected + ">" + data[i] + "</option>"
      i++
    target.html html.join("")
    return
  state_code_from_name = (name) ->
    $("select#moving_lead_MovingTo_state").find("option").filter(->
      (new RegExp("^" + name + "$")).test $(this).text()
    ).attr "value"
  $.fn.movingService = (options) ->
    form_div = $(this)
    formLoad = ->
      url = buildNewUrl(opts.form_params)
      form_div.load url, ->
        opts.update_form()
        $(".moving_form", form_div).submit submitLead
        setup_bindings()
        form_div.show()
        return

      return

    buildNewUrl = (params) ->
      base = "/v1/moving_lead/new?"
      uri = ""
      for i of params.required_fields
        uri += "moving_lead[required_fields][]=" + params.required_fields[i] + "&"
      delete params.required_fields

      for attr of params
        uri += "moving_lead[" + attr + "]=" + params[attr] + "&"  if params[attr]
      uri = uri.substring(0, uri.length - 1)
      base += encodeURI(uri)
      base

    submitLead = ->
      caller = $(this)
      return false  if @beenSubmitted
      @beenSubmitted = true
      $.ajax
        url: "/v1/moving_lead/ajax.js"
        type: "POST"
        data: $(this).serialize()
        success: (response) ->
          opts.lead_saved()
          return

        error: (req, status, err) ->
          parent = caller.parent()
          caller.replaceWith req.responseText
          opts.update_form()
          setup_bindings()
          $(".moving_form", parent).submit submitLead
          false

      false

    thankYou = ->
      form_div.html "Thank you!"
      return

    updateForm = ->

    defaults =
      update_form: updateForm
      lead_saved: thankYou

    opts = jQuery.extend(defaults, options)
    form_div.each ->
      formLoad()
      return


  load_cities_and_zips: load_cities_and_zips
  load_cities: load_cities
  load_zips: load_zips

