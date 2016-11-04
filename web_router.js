var express = require('express');
var router = express.Router();
var config = require('./config');

//controllers
var shop = require('./controllers/shop'); //login, payment
var the_app = require('./controllers/the_app'); //dashboard

//middleware
var auth = require('./middlewares/auth'); //login checker

router.get('/', the_app.index);
router.get('/login', shop.login);
router.get('/payments', shop.payments);
router.get('/charge', shop.charge);
router.get('/dashboard', the_app.dashboard);


router.get('*',function(req,res,next){
    return res.status(404).render('404');
});

module.exports = router;