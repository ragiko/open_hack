//  チュートリアルのルーティング
// :page で指定された部分のコンポーネントがレンダリングされる
// コンポーネントの定義は app.js 参照
(function(app, Router){
  'use strict';

  var routes = {
    '/guide/:page': function(page) {
      app.currentView = page;
    }
  };
  var router = new Router(routes);
  router.init();

})(app, Router);
