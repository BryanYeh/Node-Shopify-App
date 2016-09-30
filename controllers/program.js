var config = require('../config');
var express = require('express');
var shopifyAPI = require('shopify-node-api');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));

// Models
var Shop = require('../models/shop');

// Session variable
var sess;


// dashboard
exports.dashboard = function (req, res) {
    res.send('You\'ve have experienced the charging of the app using Node JS and Shopify API');
};

// uninstalling the app
exports.uninstall = function (req, res) {
    var my_shop = req.headers['x-shopify-shop-domain'];
    console.log(my_shop);
    // find store and remove from database
    Shop.findOne({myshopify_domain: my_shop}, function (err, shopObj) {
        if (shopObj) {
            console.log(shopObj);
            var uninstall_id = shopObj.uninstall_webhook_id;

            shopObj.remove(function (err) {
                if (err) console.log('---> Error: removing store from database');
                else {
                    console.log(my_shop + ': uninstalled your app');
                    console.log('shop token: ' + shopObj.token);

                    var Shopify = new shopifyAPI({
                        shop: my_shop,
                        shopify_api_key: config.shopify.api_key,
                        shopify_shared_secret: config.shopify.shared_secret,
                        access_token: shopObj.token
                    });

                    // TODO: verify request is from shopify
                    Shopify.delete('/admin/webhooks/' + uninstall_id + '.json', null, function (err) {
                        if (err) console.log('---> Error: Deleting shop\'s uninstall webhook');
                        else console.log('---> deleted webhook');
                    });
                }
            });
        }
    });


};