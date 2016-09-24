var config = {
    port: process.env.PORT || 3000,
    hostname: 'http://localhost:3000', // https://publicshopifyapp.com
    shopify: {
        api_key: 'Shopify API Key',
        shared_secret: 'Shopify Shared Secret',

        /*  Access to Article, Blog, Comment, Page, and Redirect.
         *   read_content, write_content
         *
         *   Access to Asset and Theme.
         *   read_themes, write_themes
         *
         *   Access to Product, product variant, Product Image, Collect, Custom Collection, and Smart Collection.
         *   read_products, write_products
         *
         *   Access to Customer and Saved Search.
         *   read_customers, write_customers
         *
         *   Access to Order, Transaction and Fulfillment.
         *   read_orders, write_orders
         *
         *   Access to Script Tag.
         *   read_script_tags, write_script_tags
         *
         *   Access to Fulfillment Service.
         *   read_fulfillments, write_fulfillments
         *
         *   Access to Carrier Service.
         *   read_shipping, write_shipping
         *
         *   Access to Analytics API.
         *   read_analytics
         *
         *   Access to User (SHOPIFY PLUS access only).
         *   read_users, write_users
         */
        scopes: 'read_content, write_content, read_products, write_products',
    },
    sessions: {
        session_secret: "its My secret"
    },
    db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/shopify',
    /*
     * Webhook is required for uninstall of the app
     * Cannot use 'localhost'
     * If you are using it on local machine, read more at https://help.shopify.com/api/tutorials/webhooks
     */
    web_hook: {
        uninstall: 'http:\/\/049f0b15.ngrok.io\/uninstall' //example, used ngrok "ngrok http localhost:3000"
    }
};

module.exports = config;