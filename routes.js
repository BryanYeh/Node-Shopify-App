var express = require('express');
var router = express.Router();

var config = require('./config');

var auth = require('./controllers/auth');
var prog = require('./controllers/program');


var shop_checker = function(req,res,next){
    if(!req.session || !req.session.token && !req.session.shop){
        return res.status(401).render('401');
    }
    next();
};

router.get('/', auth.index);
router.get('/login', auth.login);
router.get('/payments', shop_checker, auth.payments);
router.get('/charge', auth.charge);
router.get('/dashboard', shop_checker, prog.dashboard);
router.post('/uninstall', prog.uninstall);
router.post('/createFoodMenu', shop_checker, prog.createFoodMenu);
router.get('*',function(req,res,next){
   res.sendStatus(404);
});

module.exports = router;