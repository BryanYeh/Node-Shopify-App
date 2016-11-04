var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var webRouter = require('./web_router');
var apiRouter = require('./api_router_v1');

var app = express();

app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: false}));

//session
app.use(session({
    secret: config.sessions.session_secret,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.use('/modules/', express.static(__dirname + '/node_modules'));

//routes
app.use('/api/v1', apiRouter);
app.use('/', webRouter);

var http = require('http').Server(app);

http.listen(config.port, function () {
    console.log('-> listening on port : ' + config.port);
});