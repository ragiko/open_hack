// 投票アプリの画面遷移だけ
(function(window, $, Vue){
  'use strict';

  var fs =  require('fs');
  Vue.component('list', {template: fs.readFileSync(__dirname + '/components/list/template.html', 'utf-8')});
  Vue.component('new', {template: fs.readFileSync(__dirname + '/components/new/template.html', 'utf-8')});
  Vue.component('edit', {template: fs.readFileSync(__dirname + '/components/edit/template.html', 'utf-8')});

  window.app = new Vue({
    el: '#main',
    data: {
      currentView: 'list',
      item: {
        title: ''
      },
      items: [
        {id: 1, title: 'TODOアプリ', like: 0},
        {id: 2, title: 'BBSアプリ', like: 5},
        {id: 3, title: 'Twitterアプリ', like: 10}
    ]
    },
    methods: {
      vote: function(id){
        var item = _.findWhere(this.$data.items, {id: id});
        item.like += 1;
      },
      update: function(item) {
        window.location.href = '#/';
      },
      add: function(item) {
        var items = this.$data.items;
        var latestItem = _.max(items, function(item){ return item.id; });
        var newItem = {
          id: Number(latestItem.id) + 1,
          title: item.title,
          like: 0
        };
        console.log(newItem);
        items.push(newItem);
        window.location.href = '#/';
      }
    }
  });

  var routes = {
    '/': function() {
      app.currentView = 'list';
    },
    '/list': function() {
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
  };
  var router = new Router(routes);
  router.init();

})(window, jQuery, Vue);
