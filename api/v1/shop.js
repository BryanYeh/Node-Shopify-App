var config = require('../../config');

var Shop = require('../../models/shop');

var uninstall = function (req, res, next) {
        var my_shop = req.headers['x-shopify-shop-domain'];
        Shop.findOne({myshopify_domain: my_shop}, function (err, shopObj) {
            if (shopObj) {
                shopObj.remove(function (err) {
                    if (err) {
                        console.log('---> Error: removing store from database');
                        res.sendStatus(500);
                    }
                    else {
                        console.log('---> Success: ' + my_shop + ': uninstalled your app');
                        res.sendStatus(200);
                    }
                });
            }
        });
};
exports.uninstall_webhook = uninstall;