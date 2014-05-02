var Vue = require('vue');
var _ = require('underscore');

var app = new Vue({
    el: '#main',
    components: {
      list: require('list'),
      new: require('new'),
      edit: require('edit'),
      notfound: require('notfound')
    },
    data: {
      rootPath: '/front/demo/vote-component/',
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
      vote: function(id){
        var item = _.findWhere(this.$data.items, {id: id});
        item.like += 1;
      },
      update: function(item) {
        this.$data.currentView = 'list';
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
        this.$data.currentView = 'list';
      }
    }
});


var page = require('page');
page.base('/front/demo/vote-component');

page('/', function(){
  app.$data.item = app.init();
  app.$data.currentView = 'list';
});

page('/new', function(){
  app.$data.item = app.init();
  app.$data.currentView = 'new';
});

page('/edit/:id', function(ctx){
  app.currentView = 'edit';
  app.item = _.findWhere(app.items, {id: Number(ctx.params.id)});
});

page('*', function(){
  app.$data.item = app.init();
  app.currentView = 'notfound';
});

page();
