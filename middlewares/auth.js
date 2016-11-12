var verify_shop_name = function (req, res, next) {
    var shop = req.query.shop;
    var re = /^[a-z0-9]+(?:-[a-z0-9]+)*(.myshopify.com)$/;

    if(re.test(shop)){
        console.log('---> Success: Valid shop name');
        next();
    }
    else{
        console.log('---> Error: Invalid shop name (' + shop + ')');
        return res.status(401).render('401');
    }
};

exports.verify_shop_name = verify_shop_name;

var has_nonce = function (req, res, next) {
    if(!req.session.nonce){
        console.log('---> Error: Cannot find nonce');
        return res.status(401).render('401');
    }
    else{
        console.log('---> Success: Found nonce');
        next();
    }
};

exports.hasNonce = has_nonce;

var has_token = function (req, res, next) {
    if(!req.session.token){
        console.log('---> Error: Cannot find token');
        return res.status(401).render('401');
    }
    else{
        console.log('---> Success: Found token');
        next();
    }
};

exports.hasToken = has_token;

var has_charge = function (req, res, next) {
    if(!req.query.charge_id){
        console.log('---> Error: Cannot find charge');
        return res.status(401).render('401');
    }
    else{
        console.log('---> Success: Found charge');
        next();
    }
};

exports.hasCharge = has_charge;