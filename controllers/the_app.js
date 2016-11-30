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
    var page = typeof req.params.page === 'undefined' || !req.params.page || new RegExp("[^0-9]").exec(req.params.page) ? 1 : req.params.page;
    var sess = req.session;

    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });
    Shopify.get('/admin/products/count.json', null, function (err, data) {
       if(!err){
           var count = data.count;
           Shopify.get('/admin/products.json?limit=50&page=' + page, null, function (err, data) {
               if(!err){
                   var products = {};
                   products['maxPage'] = Math.floor(count / 2.0);
                   products['page'] = page;
                   products['products'] = data;

                   res.render('dashboard',{
                       data: products
                   });
               }
               else{
                   res.send(err);
               }
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
        variant_id = req.body.variant_id,
        option1 = req.body.option,
        price = req.body.price,
        option_id = req.body.option_id;

    var variant =
    {
        "variant": {
            "option1": option1,
            "price": price,
            "id": variant_id
        }
    };

    var options =
    {
        "product": {
            "id": product_id,
            "options": [
                {
                    "id": option_id,
                    "name": "Membership"
                }
            ]
        }

    };

    var sess = req.session;


    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    Shopify.put('/admin/products/' + product_id + '.json', options, function (err, data) {
        if (!err) {
            Shopify.put('/admin/variants/' + variant_id + '.json', variant, function (err, data) {
                if (!err) res.status(200).json({title: option1, price: price});
                else res.status(404).json({error: 'Not Found'});
            });
        }
        else res.status(404).json({ error: 'Not Found' });
    });


};

exports.updateProduct = updateProduct;