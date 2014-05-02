(function(){
  'use strict';

  require('./effect.js');
  require('./component.js');

  var app = require('./app')();
  var router = require('./router')(app);

  router.init();

})();
