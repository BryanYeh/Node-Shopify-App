module.exports.is_shopify_store = function (store_name) {
    var re = /^[a-z0-9]+(?:-[a-z0-9]+)*(.myshopify.com)$/;
    return re.test(store_name);
};

module.exports.verify_webhook = function (headers, body) {
    // Found it here: https://github.com/jonpulice/node-shopify-auth/blob/master/lib/main.js#L327
    var crypto = require('crypto');
    var config = require('../config');

    var hmac = headers['x-shopify-hmac-sha256'],
        kvpairs = [],
        message,
        digest;

    message = JSON.stringify(body);

    //Shopify seems to be escaping forward slashes when the build the HMAC
    // so we need to do the same otherwise it will fail validation
    // Shopify also seems to replace '&' with \u0026 ...
    //message = message.replace('/', '\\/');
    message = message.split('/').join('\\/');
    message = message.split('&').join('\\u0026');

    digest = crypto.createHmac('SHA256', config.shopify.shared_secret).update(message).digest('base64');

    return digest === hmac;
};