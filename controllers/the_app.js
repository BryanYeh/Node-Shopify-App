var express = require('express');
var shopifyAPI = require('shopify-node-api');
var randomString = require('randomstring');
var config = require('../config');

var Shop = require('../models/shop');

var index = function (req, res, next) {
    var sess = req.session;

    sess.shop = req.query.shop;
    Shop.findOne({myshopify_domain: sess.shop}, function (err, my_shop){
        if (err) console.log('---> Error: Initializing the store');
        else if (my_shop && my_shop.token != '' && my_shop.app_status == 'accepted') {
            sess.token = my_shop.token;
            sess.shop = my_shop.myshopify_domain;
            console.log('---> Success: Now redirecting to dashboard from index');
            res.redirect('/dashboard');
        }
        else {
            sess.nonce = randomString.generate();

            var Shopify = new shopifyAPI({
                shop: sess.shop,
                shopify_api_key: config.shopify.api_key,
                shopify_shared_secret: config.shopify.shared_secret,
                shopify_scope: config.shopify.scopes,
                redirect_uri: config.hostname + '/login',
                nonce: sess.nonce
            });

            res.redirect(Shopify.buildAuthURL());
        }
    });
};

exports.index = index;

var dashboard = function (req, res, next) {
    var sess = req.session;

    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });
    console.log("in dashboard");
    Shopify.get('/admin/products.json?limit=30', null, function (err, data){
        if(!err){
            console.log(data.products);
            res.render('dashboard',{
                products: data.products
            });
        }
        else{
            res.send(err);
        }
    });
};

exports.dashboard = dashboard;

var updateProduct = function (req, res, next) {
    //  get from form
    var product_id = req.body.product_id,
        inventory = req.body.inventory,
        weight = req.weight,
        weight_unit = req.body.weight_unit,
        price = req.body.price,
        option = req.body.option,
        sku = req.body.sku;

    var variant =
    {
        "variant": {
            "product_id": product_id,
            "price": price,
            "inventory_management": "shopify",
            "option1": option,
            "inventory_quantity": inventory,
            "weight": weight,
            "weight_unit": weight_unit,
            "requires_shipping": true,
            "sku": sku
        }
    };

    var sess = req.session;


    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    Shopify.post('/admin/products/' + product_id + '/variants.json', variant, function (err, data){
        if(!err){
            res.sendStatus(200);
        }
        else
            res.sendStatus(500);
    });

};

exports.updateProduct = updateProduct;