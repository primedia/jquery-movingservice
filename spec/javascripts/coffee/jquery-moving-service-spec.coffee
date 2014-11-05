describe 'jqueryMovingService', ->

  module = null

  beforeEach (done) ->
    require ["jquery-moving-service"], (mod) ->
      module = new mod()
      done()

  afterEach ->
    module = null

  it 'exists', ->
    expect(module).toBeTruthy()
