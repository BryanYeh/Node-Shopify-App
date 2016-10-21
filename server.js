var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

var http = require('http').Server(app);

var routes = require('./routes.js');
app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: false}));

// session configuration
app.use(session({
    secret: config.sessions.session_secret,
    resave: false,
    saveUninitialized: false
}));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/modules/', express.static(__dirname + '/node_modules'));

// include routes
app.use('/', routes);

// start the server
http.listen(config.port, function () {
    console.log('-> listening on port : ' + config.port);
});