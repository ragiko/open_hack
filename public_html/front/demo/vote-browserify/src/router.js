module.exports = function(app) {
  'use strict';

  return new Router({
    '/': function() {
      app.currentView = 'list';
    },
    '/list': function() {
      app.hasAnimation = false;
      app.currentView = 'list';
    },
    '/new': function() {
      app.item.title = '';
      app.currentView = 'new';
    },
    '/edit/:id': function(id) {
      app.currentView = 'edit';
      app.item = _.findWhere(app.items, {id: Number(id)});
    }
  });
};
