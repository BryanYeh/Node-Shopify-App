var config = require('./config');
var express = require('express');
var session = require('express-session');
var app = express();

var http = require('http').Server(app);

var routes = require('./routes.js');

app.use(session({
    secret: config.sessions.session_secret,
    resave: false,
    saveUninitialized: false
}));

app.use('/', routes);

http.listen(config.port, function () {
    console.log('-> listening on port : ' + config.port);
});