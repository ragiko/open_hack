// 投票アプリの画面遷移だけ
(function(window, $, Vue){
  'use strict';

  Vue.component('list', {template: '#list'});
  Vue.component('new', {template: '#new'});
  Vue.component('edit', {template: '#edit'});

  window.app = new Vue({
    el: '#main',
    data: {
      currentView: 'list',
      items: [
        {id: 1, title: 'TODOアプリ', like: 0},
        {id: 2, title: 'BBSアプリ', like: 5},
        {id: 3, title: 'Twitterアプリ', like: 10}
      ]
    },
    methods: {
      init: function(){
        return {title: ''};
      },
      find: function(id){
        return _.findWhere(this.$data.items, {id: Number(id)});
      },
      vote: function(id){
        var item = this.find(id);
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
        items.push(newItem);
        window.location.href = '#/';
      }
    }
  });

  var data = app.$data;
  var routes = {
    '/': function() {
      data.currentView = 'list';
    },
    '/list': function() {
      data.currentView = 'list';
    },
    '/new': function() {
      data.item = app.init();
      data.currentView = 'new';
    },
    '/edit/:id': function(id) {
      data.currentView = 'edit';
      data.item = app.find(id);
    }
  };
  var router = new Router(routes);
  router.init();

})(window, jQuery, Vue);
