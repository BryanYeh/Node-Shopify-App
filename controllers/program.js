var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json({extended: true}));

// Models
var Shop = require('../models/shop');


// dashboard
exports.dashboard = function (req, res) {
    res.send('You\'ve have experienced the charging of the app using Node JS and Shopify API');
};

// uninstalling the app
exports.uninstall = function (req, res) {
    // TODO: verify request is from shopify

    var my_shop = req.body.myshopify_domain;

    // find store and remove from database
    Shop.findOne({myshopify_domain: my_shop}, function (err, shopObj) {
        if (shopObj) {
            shopObj.remove(function (err) {
                console.log(my_shop + ': uninstalled your app');
                // TODO: remove webhook for the shop
            });
        }
    });


};