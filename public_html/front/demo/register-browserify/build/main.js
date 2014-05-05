(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  'use strict';
  return new Vue({
    el: '#main',
    data: {
      currentView: 'input',
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
      confirm: function(e) {
        var data;
        data = this.$data;
        data.hasError = false;
        e.preventDefault();
        return $.ajax({
          type: 'PUT',
          url: '/api/sample/user',
          data: data.user
        }).done(function(res) {
          return data.currentView = 'confirm';
        }).fail(function(res) {
          var errors;
          errors = $.parseJSON(res.responseText).data;
          data.errors = errors;
          return data.hasError = true;
        });
      },
      back: function(e) {
        return this.$data.currentView = 'input';
      },
      add: function(e) {
        var data;
        data = this.$data;
        e.preventDefault();
        return $.ajax({
          type: 'POST',
          url: '/api/sample/user',
          data: data.user
        }).done(function(res) {
          return data.currentView = 'complete';
        }).fail(function(res) {
          var errors;
          errors = $.parseJSON(res.responseText).data;
          data.errors = errors;
          return data.hasError = true;
        });
      }
    }
  });
};


},{}],2:[function(require,module,exports){
var fs;



Vue.component('input', {
  template: "<div class=\"row\">\n  <div class=\"col-md-3 col-md-offset-3\">\n\n    <div class=\"alert alert-danger\" v-show=\"hasError\" v-effect=\"fadein\">\n      <p v-repeat=\"errors | filterBy '_'\">{{$value}}</p>\n    </div>\n\n    <form role=\"form\" v-on=\"submit:confirm\">\n      <div class=\"form-group\">\n\t<label for=\"name\">ユーザー名</label>\n\t<input type=\"text\" class=\"form-control\" id=\"name\" placeholder=\"taro\" v-model=\"user.name\">\n      </div>\n      <div class=\"form-group\">\n\t<label for=\"email\">メールアドレス</label>\n\t<input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"address@example.com\" v-model=\"user.email\">\n      </div>\n      <div class=\"form-group\">\n\t<label for=\"password\">パスワード</label>\n\t<input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" v-model=\"user.password\">\n      </div>\n      <div class=\"form-group\">\n\t<label for=\"date\">誕生日</label>\n\t<input type=\"date\" class=\"form-control\" id=\"date\" placeholder=\"yyyy-mm-dd\" v-model=\"user.birthday\">\n      </div>\n      <input type=\"submit\" class=\"btn btn-default\" value=\"確認\">\n    </form>\n  </div>\n</div>\n"
});

Vue.component('confirm', {
  template: "<div class=\"row\">\n  <div class=\"col-md-2 col-md-offset-3\">\n    ユーザー名: {{user.name}}\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-md-2 col-md-offset-3\">\n    メールアドレス: {{user.email}}\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-md-2 col-md-offset-3\">\n    パスワード: ********\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-md-2 col-md-offset-3\">\n    誕生日: {{user.birthday}}\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-md-2 col-md-offset-3\">\n    <button v-on=\"click:back\" class=\"btn btn-default\">戻る</button>\n    <button v-on=\"click:add\" class=\"btn btn-default\">登録</button>\n  </div>\n</div>\n\n"
});

Vue.component('complete', {
  template: "<div class=\"row\">\n  <div class=\"col-md-2 col-md-offset-3\">\n    ユーザー登録が完了しました\n    <a href=\"/user/login\">ログイン</a>\n  </div>\n</div>\n"
});


},{}],3:[function(require,module,exports){
Vue.effect('fadein', {
  enter: function(el, insert, timeout) {
    $(el).addClass('animated fadeIn');
    return insert(el);
  },
  leave: function(el, remove, timeout) {
    return remove(el);
  }
});


},{}],4:[function(require,module,exports){
'use strict';
require('./effect.coffee');

require('./component.coffee');

window.app = require('./app.coffee')();


},{"./app.coffee":1,"./component.coffee":2,"./effect.coffee":3}]},{},[4])