module.exports = (app) ->
  'use strict'

  data = app.$data
  new Router
    '/': ->
      data.currentView = 'list'
    '/list': ->
      data.currentView = 'list'
    '/new': ->
      data.item = app.init()
      data.currentView = 'new'
    '/edit/:id': (id) ->
      data.currentView = 'edit'
      data.item = app.find(id)
