var express = require('express');

var shopifyAPI = require('shopify-node-api');

var randomString = require('randomstring');

var config = require('../config');

var sess;

exports.index = function (req, res) {
    sess = req.session;
    sess.nonce = randomString.generate();
    sess.shop = req.query.shop;

    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        shopify_scope: config.shopify.scopes,
        redirect_uri: config.hostname + '/login',
        nonce: sess.nonce
    });

    var auth_url = Shopify.buildAuthURL();
    res.redirect(auth_url);
};

exports.login = function (req, res) {
    sess = req.session;
    if (!sess.nonce) {
        sess.nonce = randomString.generate();
    }

    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        shopify_scope: config.shopify.scopes,
        redirect_uri: config.hostname + '/payments',
        nonce: sess.nonce
    });
    query_params = req.query;
    Shopify.exchange_temporary_token(query_params, function (err, data) {
        sess.token = data['access_token'];
        res.redirect(config.hostname + '/payments');
    });


};

exports.payments = function (req, res) {
    sess = req.session;
    if (!sess.token) {
        console.log('no token');
    }
    else {
        console.log(sess.token);
    }
    
    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    var post_data = {
        "recurring_application_charge": {
            "name": "Node Public App",
            "price": 100.0,
            "return_url": "http:\/\/localhost:3000\/test",
            "capped_amount": 100,
            "terms": "$100 just to test",
            "test": true
        }
    };

    Shopify.post('/admin/recurring_application_charges.json', post_data, function (err, data, headers) {
        console.log(data);
        res.redirect(data['recurring_application_charge']['confirmation_url']);
    });
};

exports.test = function (req, res) {
    res.json({status: 'success'});
};