// ユーザー登録を API化 したサンプル
// 参照: http://vuejs.org/examples/firebase.html
(function(window, $, Vue){
  'use strict';

  window.app = new Vue({
    el: '#main',
    data: {
      user: {
        name: '',
        email: '',
        password: '',
        birthday: ''
      },
      errors: {},
      hasError: false
    },
    methods: {
      // jQueryを使ったXHR
      addUser: function (e) {
        var data = this.$data;
        // たとえば、実装前は仮に成功したとして以下のように処理を書けば動きだけを実装できる
        // window.location.href = '/user/login';
        
        e.preventDefault();
        $.ajax({
          type: 'POST',
          url: '/api/sample/user',
          data: data.user
        })
        .done(function(res){
          window.location.href = '/user/login';
        })
        .fail(function(res){
          var errors = $.parseJSON(res.responseText).data;
          data.errors = errors;
          data.hasError = true;
        });
      }
    }
  });

})(window, jQuery, Vue);
