var express = require('express');

var shopifyAPI = require('shopify-node-api');
var randomString = require('randomstring');
var config = require('../config');

var Shop = require('../models/shop');

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

    res.redirect(Shopify.buildAuthURL());
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
        res.redirect('/');
    }
    
    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    Shopify.get('/admin/shop.json', null, function (err, data, headers) {
        console.log('------------------------------------');
        console.log(data);
        console.log('------------------------------------');

        // Shop.findOne({myshopify_domain: data['shop']['myshopify_domain']},function (err, shopObj){
        //     if (err) {
        //         console.log('Got an error');
        //     } else if (shopObj) {
        //         console.log('Found:');
        //     } else {
        //         console.log('User not found!');
        //     }
        // });
        //
        // var my_shop = new Shop({
        //     id: data['shop']['id'],
        //     email : data['shop']['email'],
        //     phone : data['shop']['phone'],
        //     shop_owner : data['shop']['shop_owner'],
        //     timezone : data['shop']['timezone'],
        //     domain : data['shop']['domain'],
        //     myshopify_domain: data['shop']['myshopify_domain'],
        //     plan_name: data['shop']['plan_name'],
        //     app_status: 'pending'
        // });

        /*
         * check if myshopify_domain is in db
         *      - if not continue
         *          -save
         *      - else
         *          go to main app
         *
         * what should be saved
         * id
         * email
         * domain
         * phone
         * timezone
         * shop_owner
         * plan_name : affiliate
         * myshopify_domain
         *
         */
    });


    var post_data = {
        "application_charge": {
            "name": "1 Time Super Charge",
            "price": 1000.05,
            "return_url": "http:\/\/localhost:3000\/charge",
            "test": true
        }
    };

    Shopify.post('/admin/application_charges.json', post_data, function (err, data, headers) {
        res.redirect(data['application_charge']['confirmation_url']);
    });
};

exports.charge = function (req, res) {
    var charge_id = req.query.charge_id;

    sess = req.session;
    if (!sess.token) {
        res.redirect('/');
    }

    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    Shopify.get('/admin/application_charges/' + charge_id + '.json', null, function (err, data, headers) {
        if (data['application_charge']['status'] == 'declined') {
            res.redirect(config.hostname + '/payments');
        }
        else {
            Shopify.post('/admin/application_charges/' + charge_id + '/activate.json', data, function (err, dataCharged, headers) {
                console.log('-----------------------------------');
                console.log(dataCharged);
            });
        }
    });
};