assert = require('power-assert')

describe 'currentView', ->
  it 'should return "list" at first',->
    currentView = app.currentView
    assert.ok currentView == 'list'
