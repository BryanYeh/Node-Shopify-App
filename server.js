var config = require('./config');
var express = require('express');
var app = express();

var http = require('http').Server(app);

var routes = require('./routes.js');
app.use('/', routes);

http.listen(config.port, function () {
    console.log('-> listening on port : ' + config.port);
});