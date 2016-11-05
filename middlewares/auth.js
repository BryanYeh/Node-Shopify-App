var verify_shop_name = function (req, res, next) {
    var shop = req.query.shop;
    var re = /^[a-z0-9]+(?:-[a-z0-9]+)*(.myshopify.com)$/;

    if(re.test(shop)){
        console.log('---> Success: Valid shop name');
        next();
    }
    else{
        console.log('---> Error: Invalid shop name (' + shop + ')');
        res.sendStatus(404);
    }
};

exports.veryify_shop_name = verify_shop_name;