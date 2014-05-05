assert = require('power-assert')

data = app.$data

describe 'vote method', ->
  it 'should add +1 like',->
    items = [
      {id: 1, like: 10}
      {id: 2, like: 10}
      {id: 3, like: 10}
    ]
    actual = data.items = items
    app.vote(2)
    assert.ok actual[0].like is 10, 'id:1 is not target'
    assert.ok actual[1].like is 11, 'id:2 is target'
    assert.ok actual[2].like is 10, 'id:3 is not target'

describe 'add method', ->
  it 'should add a new item with max+1 id',->
    items = [
      {id: 1, like: 10}
      {id: 2, like: 10}
      {id: 3, like: 10}
    ]
    actual = data.items = items
    app.add({title: 'added'})
    assert.ok actual[3].id is 4

describe 'find method', ->
  it 'should return item',->
    items = [
      {id: 1, like: 10}
      {id: 2, like: 11}
      {id: 3, like: 12}
    ]
    data.items = items
    actual = item = app.find(2)
    assert.ok actual.id is 2
    assert.ok actual.like is 11
