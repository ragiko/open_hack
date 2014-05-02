module.exports = function(app) {
  'use strict';

  return new Router({
    '/': function() {
      app.item = app.init();
      app.currentView = 'list';
    },
    '/list': function() {
      app.item = app.init();
      app.currentView = 'list';
    },
    '/new': function() {
      app.item = app.init();
      app.currentView = 'new';
    },
    '/edit/:id': function(id) {
      app.currentView = 'edit';
      app.item = _.findWhere(app.items, {id: Number(id)});
    }
  });
};
