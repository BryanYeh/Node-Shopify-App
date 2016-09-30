var config = require('../config');

var mongoose = require('mongoose');
mongoose.connect(config.db);
var Schema = mongoose.Schema;

var shopSchema = new Schema({
    id: {type: Number},
    email: {type: String},
    phone: {type: Number},
    shop_owner: {type: String},
    timezone: {type: String},
    domain: {type: String},
    myshopify_domain: {type: String, unique: true, required: true},
    plan_name: {type: String},
    app_created_at: {type: Date, default: Date.now()},
    app_updated_at: {type: Date, default: Date.now()},
    app_status: {type: String, default: 'pending'},
    charge_id: {type: String},
    uninstall_webhook_id: {type: String},
    token: {type: String}
});

// on every save, add the date
shopSchema.pre('save', function (next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.app_updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.app_created_at)
        this.app_created_at = currentDate;

    next();
});

var Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;