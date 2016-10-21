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
    var foods = [
        { name: 'Sushi', vendor: 'Set the Bar' },
        { name: 'Bread', vendor: 'Braker Brad' },
        { name: 'Sandwich', vendor: 'Muk Dunloud' }
    ];

    res.render('index', {
            foods: foods
        });
};

exports.createFoodMenu = function(req, res){
    res.send(req.body.mTimes);
    var products = [
        {
            "product": {
                "title": "Sushi",
                "body_html": "Fish with rich mixed together",
                "vendor": "Set the Bar",
                "product_type": "Food",
                "images": [
                    {
                        "src": "http:\/\/lorempixel.com\/600\/600\/food\/4"
                    }
                ]
            }
        },
        {
            "product": {
                "title": "Bread",
                "body_html": "Just your average bread",
                "vendor": "Braker Brad",
                "product_type": "Food",
                "images": [
                    {
                        "src": "http:\/\/lorempixel.com\/600\/600\/food\/10"
                    }
                ]
            }
        },
        {
            "product": {
                "title": "Sandwich",
                "body_html": "A nasty sandwich you don't want to eat",
                "vendor": "Muk Dunloud",
                "product_type": "Food",
                "images": [
                    {
                        "src": "http:\/\/lorempixel.com\/600\/600\/food\/4"
                    }
                ]
            }
        }

    ];
};


// uninstalling the app
exports.uninstall = function (req, res) {
    if (helpers.verify_webhook(req.headers, req.body)) {
        if (req.headers['x-shopify-shop-domain']) {
            var my_shop = req.headers['x-shopify-shop-domain'];
            if (helpers.is_shopify_store(my_shop)) {
                // find store and remove from database
                Shop.findOne({myshopify_domain: my_shop}, function (err, shopObj) {
                    if (shopObj) {
                        shopObj.remove(function (err) {
                            if (err) {
                                console.log('---> Error: removing store from database');
                                res.sendStatus(500);
                            }
                            else {
                                console.log(my_shop + ': uninstalled your app');
                                res.sendStatus(200);
                            }
                        });
                    }
                });
            }
            else console.log('---> Error: not shopify store');
        }
        else console.log('---> Error: not shopify store');
    }
    else console.log('---> Error: invalid shopify uninstall webhook request');
};