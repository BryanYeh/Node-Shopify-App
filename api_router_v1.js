var express = require('express');
var router = express.Router();
var config = require('./config');

//controllers
var shop = require('./api/v1/shop'); //uninstall

//middleware
var auth = require('./api/v1/auth'); //verify webhook

router.post('/uninstall', shop.uninstall);

module.exports = router;