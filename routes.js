var express = require('express');
var router = express.Router();

var config = require('./config');

var auth = require('./controllers/auth');
var prog = require('./controllers/program')

router.get('/', auth.index);
router.get('/login', auth.login);
router.get('/payments', auth.payments);
router.get('/charge', auth.charge);
router.get('/dashboard', prog.dashboard);
router.post('/uninstall', prog.uninstall);

module.exports = router;