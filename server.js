var express = require('express');
var app = express();
var http = require('http').Server(app);

var config = require('./config');

http.listen(config.port, function () {
    console.log('-> listening on * : ' + config.hostname);
});