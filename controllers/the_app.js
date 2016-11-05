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
            // res.redirect('/dashboard');
            res.send('will redirect to dashboard');
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

            // res.redirect(Shopify.buildAuthURL());
            console.log('---> Success: will redirect to buildAuthUrl');
            res.send(sess.nonce);
        }
    });
};

exports.index = index;