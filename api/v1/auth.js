var crypto = require('crypto');
var config = require('../../config');

var verify_webhook = function (req, res, next) {
    // Found it here: https://github.com/jonpulice/node-shopify-auth/blob/master/lib/main.js#L327

    var hmac = req.headers['x-shopify-hmac-sha256'],
        kvpairs = [],
        message,
        digest;

    message = JSON.stringify(req.body);

    //Shopify seems to be escaping forward slashes when the build the HMAC
    // so we need to do the same otherwise it will fail validation
    // Shopify also seems to replace '&' with \u0026 ...
    //message = message.replace('/', '\\/');
    message = message.split('/').join('\\/');
    message = message.split('&').join('\\u0026');

    digest = crypto.createHmac('SHA256', config.shopify.shared_secret).update(message).digest('base64');

    if (digest === hmac) {
        console.log('---> Success: Uninstall webhook verified');
        next();
    }
    else{
        console.log('---> Error: Unauthorized access to uninstall webhook');
        res.sendStatus(401);
    }
};
exports.verify_webhook = verify_webhook;