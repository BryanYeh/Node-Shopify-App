module.exports.is_shopify_store = function (store_name) {
    var re = /^[a-z0-9]+(?:-[a-z0-9]+)*(.myshopify.com)$/;
    return re.test(store_name);
};