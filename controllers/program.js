var config = require('../config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var helpers = require('../helpers/functions');

app.use(bodyParser.urlencoded({extended: true}));

// Models
var Shop = require('../models/shop');

// dashboard
exports.dashboard = function (req, res) {
    res.send('You\'ve have experienced the charging of the app using Node JS and Shopify API');
};


// uninstalling the app
exports.uninstall = function (req) {
    if (req.headers['x-shopify-shop-domain']) {
        var my_shop = req.headers['x-shopify-shop-domain'];
        if (helpers.is_shopify_store(my_shop)) {
            // find store and remove from database
            Shop.findOne({myshopify_domain: my_shop}, function (err, shopObj) {
                if (shopObj) {

                    // TODO: verify request is from shopify

                    shopObj.remove(function (err) {
                        if (err) console.log('---> Error: removing store from database');
                        else console.log(my_shop + ': uninstalled your app');
                    });

                }
            });
        }
        else console.log('not shopify store');
    }
    else console.log('not shopify store');
};