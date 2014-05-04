// 
(function(window, $, Vue){
  'use strict';

  window.user = new Vue({
    el: '#user',
    data: {
      name: ''
    },
    ready: function(){
      this.fetchUser();
    },
    methods: {
      fetchUser: function () {
        var data = this.$data;
        $.getJSON('/api/sample/me')
        .done(function(res){
          data.name = res.data;
        });
      }
    }
  });

})(window, jQuery, Vue);
