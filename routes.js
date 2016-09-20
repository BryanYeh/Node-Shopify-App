var express = require('express');
var router = express.Router();

var config = require('./config');

var auth = require('./controllers/auth');

router.get('/', auth.index);
router.get('/login', auth.login);
router.get('/payments', auth.payments);
router.get('/charge', auth.charge);

module.exports = router;