(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// 投票アプリの画面遷移だけ
(function(window, $, Vue){
  'use strict';

  

  Vue.component('list', {template: "<h3>一覧</h3>\n<p><a href=\"#/new\">追加</a></p>\n<ul>\n  <li v-repeat=\"items\">\n    <p>\n      {{title}} ({{like}})\n      [<a href=\"#\" v-on=\"click:vote(id)\">like</a>]\n      [<a href=\"#/edit/{{id}}\">編集</a>]\n    </p>\n  </li>\n</ul>\n\n"});
  Vue.component('new', {template: "<h3>追加</h3>\n<p><a href=\"#/list\">一覧に戻る</a></p>\n<input type=\"text\" v-model=\"item.title\">\n<button v-on=\"click:add(item)\">保存</button>\n"});
  Vue.component('edit', {template: "<h3>編集</h3>\n<p><a href=\"#/list\">一覧に戻る</a></p>\n<input type=\"text\" v-model=\"item.title\">\n<button v-on=\"click:update(item)\">保存</button>\n\n"});

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

},{}]},{},[1])