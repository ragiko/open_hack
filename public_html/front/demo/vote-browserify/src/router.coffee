module.exports = (app) ->
  'use strict'
  new Router
    '/': ->
      app.item = app.init()
      app.currentView = 'list'
    '/list': ->
      app.item = app.init()
      app.currentView = 'list'
    '/new': ->
      app.item = app.init()
      app.currentView = 'new'
    '/edit/:id': (id) ->
      app.currentView = 'edit'
      app.item = _.findWhere app.items, {id: Number(id)}
