var express = require('express');
var shopifyAPI = require('shopify-node-api');
var config = require('../config');

var Shop = require('../models/shop');

var login = function (req, res, next) {
    var sess = req.session;

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
        if (err) console.log('---> Error: Failed to get permanent token');
        else if (data['access_token']) {
            sess.token = data['access_token'];
            res.redirect(config.hostname + '/payments');
        }
        else {
            console.log('---> Error: Cannnot find permanent token');
            res.status(401).render('401');
        }
    });
};

exports.login = login;

var payments = function (req, res, next) {
    var sess = req.session;

    // Shopify API object
    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    Shopify.get('/admin/shop.json', null, function (err, data) {
        Shop.findOne({myshopify_domain: data['shop']['myshopify_domain']}, function (err, shopObj) {
            if (err) {
                console.log('---> Error: Connecting to database to look for shop');
                res.sendStatus(500);
            }
            // shop found
            else if (shopObj) {
                // app paid (should never reach this part)
                if (shopObj.app_status == 'accepted')
                    res.redirect('/dashboard');
                // app not paid
                else {
                    // remove shop info from database and refresh page
                    shopObj.remove(function (err) {
                        if (err) {
                            console.log('Error: Unable to connect to database to remove shop');
                            res.sendStatus(500);
                        }
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
                        console.log('---> Error: Saving new shop info into database');
                        res.sendStatus(500);
                    }
                    else sess.nonce = '';
                });

                var post_data = {
                    "application_charge": {
                        "name": "1 Time Fake Test Payment",
                        "price": 9999.99,
                        "return_url": config.hostname + '/charge',
                        "test": true
                    }
                };

                // Ask shop owner to accept/decline charge
                Shopify.post('/admin/application_charges.json', post_data, function (err, data, headers) {
                    if(err){
                        console.log('---> Error: Unable to post request charge');
                        res.sendStatus(500);
                    }
                    res.redirect(data['application_charge']['confirmation_url']);
                });
            }
        });
    });
};

exports.payments = payments;

var charge = function (req, res, next) {
    var sess = req.session;

    var charge_id = req.query.charge_id;

    // Shopify API token
    var Shopify = new shopifyAPI({
        shop: sess.shop,
        shopify_api_key: config.shopify.api_key,
        shopify_shared_secret: config.shopify.shared_secret,
        access_token: sess.token
    });

    Shopify.get('/admin/application_charges/' + charge_id + '.json', null, function (err, data, headers) {
        // shop owner decline charge
        if (data['application_charge']['status'] == 'declined') {
            console.log('---> Meep: Shop owner declined payments');
            res.redirect(config.hostname + '/payments');
        }
        // shop owner accepted charge
        else {
            Shopify.post('/admin/application_charges/' + charge_id + '/activate.json', data, function (err, dataCharged, headers) {
                if(err) {
                    console.log('Error: Unable to activate charge on Shopify\'s end');
                    res.sendStatus(500);
                }
                else{
                    Shop.find({myshopify_domain: sess.shop}, function (err, my_shop) {
                        if(err){
                            console.log('---> Error: Unable to  connect to database to activate shop.');
                            res.sendStatus(500);
                        }
                        else if (my_shop.length > 0) {
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
                                            if (err) {
                                                console.log('---> Error: saving hook to database');
                                                res.sendStatus(500);
                                            }
                                        });
                                    }
                                });
                                res.redirect(config.hostname + '/dashboard');
                            });
                        }

                    });
                }
            });
        }
    });
};

exports.charge = charge;