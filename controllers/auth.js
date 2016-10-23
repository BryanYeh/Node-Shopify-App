var express = require('express');
var shopifyAPI = require('shopify-node-api');
var randomString = require('randomstring');
var config = require('../config');
var helpers = require('../helpers/functions');

// Models
var Shop = require('../models/shop');

// Session variable
var sess;

// landing page for starting app
exports.index = function (req, res) {
    // store nonce and shop into session
    sess = req.session;
    sess.shop = req.query.shop;

    // make sure store is shopify name store
    if (helpers.is_shopify_store(sess.shop)) {
        Shop.findOne({myshopify_domain: sess.shop}, function (err, my_shop) {
            if (err) console.log('---> Error: Initializing the store');
            else if (my_shop && my_shop.token != '' && my_shop.app_status == 'accepted') {
                sess.token = my_shop.token;
                sess.shop = my_shop.myshopify_domain;
                console.log('---> redirecting to dashboard');
                res.redirect('/dashboard');
            }
            else {
                sess.nonce = randomString.generate();

                // Shopify API object
                var Shopify = new shopifyAPI({
                    shop: sess.shop,
                    shopify_api_key: config.shopify.api_key,
                    shopify_shared_secret: config.shopify.shared_secret,
                    shopify_scope: config.shopify.scopes,
                    redirect_uri: config.hostname + '/login',
                    nonce: sess.nonce
                });

                // send user to install the app
                res.redirect(Shopify.buildAuthURL());
            }
        });
    }
    else res.send('Invalid store');


};

// login check
exports.login = function (req, res) {
    sess = req.session;

    // should only be accessible through shopify
    if (!sess.nonce) res.send('You must go through your Shopify store to access this app.');
    else {
        // Shopify API object
        var Shopify = new shopifyAPI({
            shop: sess.shop,
            shopify_api_key: config.shopify.api_key,
            shopify_shared_secret: config.shopify.shared_secret,
            shopify_scope: config.shopify.scopes,
            redirect_uri: config.hostname + '/payments',
            nonce: sess.nonce
        });

        // exchange for a token
        query_params = req.query;
        Shopify.exchange_temporary_token(query_params, function (err, data) {
            if (err) console.log('--> Error: Trading for perm token');
            else if (data['access_token']) {
                sess.token = data['access_token'];
                res.redirect(config.hostname + '/payments');
            }
            else {
                res.send('Error login in!');
                console.log('---> ERROR : saving @ /login');
            }
        });
    }

};

// Payments
exports.payments = function (req, res) {
    sess = req.session;

    // should only be accessible through shopify
    if (!sess.token)
        res.send('You must go through your Shopify store to access this app.');

    // Shopify API object
    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    // Get shop info
    Shopify.get('/admin/shop.json', null, function (err, data) {
        // Find shop in database
        Shop.findOne({myshopify_domain: data['shop']['myshopify_domain']}, function (err, shopObj) {

            // Error occured
            if (err) {
                res.send('Error finding your shop!');
                console.log('---> ERROR : finding shop @ /payments');
            }

            // shop is found
            else if (shopObj) {
                // app paid (should never reach this part)
                if (shopObj.app_status == 'accepted')
                    res.redirect('/dashboard');

                // app not paid   
                else {
                    // remove shop info from database and refresh page
                    shopObj.remove(function (err) {
                        if (err) console.log('Error : removing shop from database @ /payments');
                        res.redirect('/payments');
                    });
                }
            }

            // shop not found
            else {

                // store needed shop info into database
                var my_shop = new Shop({
                    id: data['shop']['id'],
                    email: data['shop']['email'],
                    phone: data['shop']['phone'],
                    shop_owner: data['shop']['shop_owner'],
                    timezone: data['shop']['timezone'],
                    domain: data['shop']['domain'],
                    myshopify_domain: data['shop']['myshopify_domain'],
                    plan_name: data['shop']['plan_name'],
                    app_status: 'pending',
                    charge_id: '',
                    uninstall_webhook_id: '',
                    token: sess.token
                });

                my_shop.save(function (err) {
                    if (err) {
                        console.log('---> ERROR : saving @ /payments');
                        res.redirect(config.hostname + '/payments');
                    }
                    else sess.nonce = '';
                });


                var post_data = {
                    "application_charge": {
                        "name": "1 Time Super Charge",
                        "price": 1000.05,
                        "return_url": config.hostname + '/charge',
                        "test": true
                    }
                };

                // Ask shop owner to accept/decline charge
                Shopify.post('/admin/application_charges.json', post_data, function (err, data, headers) {
                    res.redirect(data['application_charge']['confirmation_url']);
                });
            }
        });
    });


};

// charge for the app
exports.charge = function (req, res) {
    sess = req.session;
    if (!req.query.charge_id && !sess.token) res.send('You must launch app through Shopify admin');
    else {
        var charge_id = req.query.charge_id;

        // Shopify API token
        var Shopify = new shopifyAPI({
            shop: sess.shop,
            shopify_api_key: config.shopify.api_key,
            shopify_shared_secret: config.shopify.shared_secret,
            access_token: sess.token
        });

        // check if shop owner accepted charge
        Shopify.get('/admin/application_charges/' + charge_id + '.json', null, function (err, data, headers) {
            // shop owner decline charge
            if (data['application_charge']['status'] == 'declined') {
                res.redirect(config.hostname + '/payments');
            }

            // shop owner accepted charge
            else {
                Shopify.post('/admin/application_charges/' + charge_id + '/activate.json', data, function (err, dataCharged, headers) {
                    Shop.find({myshopify_domain: sess.shop}, function (err, my_shop) {
                        if (my_shop.length > 0) {
                            my_shop = my_shop[0];
                            my_shop.charge_id = charge_id;
                            my_shop.app_status = 'accepted';
                            my_shop.save(function (err) {
                                if (err) console.log('---> Error: saving accepted shop charge');

                                var webhook = {
                                    "webhook": {
                                        "topic": 'app\/uninstalled',
                                        "address": config.web_hook.uninstall,
                                        "format": 'json'
                                    }
                                };

                                Shopify.post('/admin/webhooks.json', webhook, function (err, dataWeb) {
                                    if (err) console.log('---> Error: registering webhook');
                                    else {
                                        my_shop.uninstall_webhook_id = dataWeb['webhook']['id'];
                                        my_shop.save(function (err) {
                                            if (err) console.log('--> Error: saving hook to database');
                                        });
                                    }
                                });
                                res.redirect(config.hostname + '/dashboard');
                            });
                        }

                    });
                });
            }
        });
    }
    
};