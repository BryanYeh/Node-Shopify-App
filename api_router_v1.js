var express = require('express');
var router = express.Router();

//controllers
var shop = require('./api/v1/shop'); //uninstall

//middleware
var auth = require('./api/v1/auth'); //verify webhook

router.post('/uninstall', auth.verify_webhook, shop.uninstall_webhook);

module.exports = router;