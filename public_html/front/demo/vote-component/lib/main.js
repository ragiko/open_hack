var Vue = require('vue');
var page = require('page');
var _ = require('underscore');

var app = new Vue({
    el: '#main',
    components: {
      list: require('list'),
      new: require('new'),
      edit: require('edit')
    },
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


page.base('/front/demo/vote-component');

page('/', function(ctx){
  var hash = ctx.hash;
  console.log(hash);
  if (hash === '/new') {
    app.$data.currentView = 'new';
  } else if (hash === '/list') {
    app.$data.currentView = 'list';
  } else if(hash.contains('/edit')) {
    app.currentView = 'edit';
    app.item = _.findWhere(app.items, {id: Number(ctx.params.id)});
  }
});

page();
