var express = require('express');

var shopifyAPI = require('shopify-node-api');

var randomString = require('randomstring');

var config = require('../config');
var token;


exports.index = function (req, res, next) {
    // TODO: store randomly generated nonce into session
    var randomNonce = randomString.generate();

    var Shopify = new shopifyAPI({
        shop: req.query.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        shopify_scope: config.shopify.scopes,
        redirect_uri: config.hostname + '/login',
        nonce: randomNonce
    });

    var auth_url = Shopify.buildAuthURL();
    res.redirect(auth_url);
};

exports.login = function (req, res, next) {
    // TODO: if no nonce is in session generate a session
    var randomNonce = randomString.generate();


    var Shopify = new shopifyAPI({
        shop: req.query.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        shopify_scope: config.shopify.scopes,
        redirect_uri: config.hostname + '/payments',
        nonce: randomNonce
    });

    query_params = req.query;
    Shopify.exchange_temporary_token(query_params, function (err, data) {
        token = data['access_token'];
    });
};

exports.payments = function (req, res, next) {
    var Shopify = new shopifyAPI({
        shop: req.query.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: token
    });

    var post_data = {
        "recurring_application_charge": {
            "name": "Super Duper Plan",
            "price": 10.0,
            "return_url": "http:\/\/localhost:3000\/makeProduct",
            "capped_amount": 100,
            "terms": "$1 for 1000 emails",
            "test": true
        }
    };

    Shopify.post('/admin/recurring_application_charges.json', post_data, function (err, data, headers) {
        res.redirect(data['recurring_application_charge']['confirmation_url']);
    });
};