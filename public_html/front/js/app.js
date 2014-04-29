// チュートリアルのアプリケーション
(function(exports, $){
  'use strict';

  // ルーティングによって表示されるコンポーネントを切り替える。routes.js 参照
  Vue.component('first', {template: '#first'});
  Vue.component('about', {template: '#about'});
  Vue.component('event', {template: '#event'});
  Vue.component('route', {template: '#route'});
  Vue.component('api', {template: '#api'});

  exports.app = new Vue({
    el: '#main',
    data: {
      currentView: 'first',
      // about のデモで利用する userモデル
      user: {
        name: 'taro',
        email: 'taro@example.com'
      },
      // event のデモで利用する total
      total: 100,
      // api のデモで利用する commits
      commits: [],
      // ユーザー一覧
      users: []
    },
    methods: {
      // 加算
      plus: function() {
        this.total++;
      },
      // 減算
      minus: function() {
        this.total--;
      },
      // jQueryを使ったXHR
      fetchData: function () {
        self = this;
        $.getJSON('https://api.github.com/repos/yyx990803/vue/commits?per_page=3&sha=master')
        .done(function(res){
          self.commits = res;
        })
        .fail(function(){
          alert('error');
        });
      },
      // GroupWorkBase のAPIサーバーとの会話
      fetchUser: function (){
        $.getJSON('/api/sample/users')
          .done(function(res){
            app.users = res.data;
          });
      }
    }
  });

  app.fetchUser();

})(window, jQuery);
