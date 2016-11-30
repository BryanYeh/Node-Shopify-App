var express = require('express');
var router = express.Router();
var config = require('./config');

//controllers
var shop = require('./controllers/shop'); //login, payment
var the_app = require('./controllers/the_app'); //dashboard

//middleware
var auth = require('./middlewares/auth'); //login checker

router.get('/', auth.verify_shop_name, the_app.index);
router.get('/login', auth.hasNonce, shop.login);
router.get('/payments', auth.hasToken, shop.payments);
router.get('/charge', auth.hasCharge, shop.charge);
router.get('/dashboard(/:page)?', auth.hasToken, the_app.dashboard);
router.post('/membership', auth.hasToken, the_app.updateProduct);


router.get('*', function(req,res,next){
    return res.status(404).render('404');
});

module.exports = router;