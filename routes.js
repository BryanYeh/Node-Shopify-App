var express = require('express');
var router = express.Router();

var config = require('./config');

var users = require('./controllers/users');

router.get('/', users.index);
router.get('/login', users.login);
router.get('/payments', users.payments);

module.exports = router;