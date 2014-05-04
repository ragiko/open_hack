'use strict';

require('./effect.coffee');
require('./component.coffee');

app = require('./app.coffee')();
router = require('./router.coffee')(app);

router.init();
