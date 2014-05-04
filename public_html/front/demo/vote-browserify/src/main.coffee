'use strict';

require('./effect.coffee');
require('./component.coffee');

window.app = require('./app.coffee')();
router = require('./router.coffee')(window.app);

router.init();
