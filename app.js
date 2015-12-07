/**
*Module Dependencies
*/
var
  express = require('express'),
  logger = require('morgan'),
  cookies = require('cookie-parser'),
  bParser = require('body-parser'),
  session = require('express-session');
//==============================================================================
/**
*Create app instance
*/
var app = express();
//==============================================================================
/**
*Module variables
*/
var
  routes = require('./routes/routes'),
  port = process.env.PORT || 3000;

//==============================================================================
/**
*Configuration and settings
*/
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//==============================================================================
/**
*Middleware
*/
app.use(logger('dev'));
app.use(bParser.json());
app.use(bParser.urlencoded({ extended: true }));
app.use(cookies());
app.use(session({
  name: 'nodify-app.sess',  secret: 'shhhhh!!!!', resave: false,
  saveUninitialized: false}));
app.use(express.static(__dirname + '/public'));
//==============================================================================
/**
*Routes
*/
app.use('/', routes);
//==============================================================================
/**
*Bind to port
*/
app.listen(port, function() {
	console.log("Running on: ",port);
});
//==============================================================================
