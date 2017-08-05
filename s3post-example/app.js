var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);
var epa = require("epa").getEnvironment();
var s3Config = epa.get("s3");

var iam = require("iam");
var iamConfig = require("./iam/iamConfig");

//connecting to mlab to store session?
var store = new MongoDBStore(
      {
        uri: s3Config.mLabSession,
        collection: 'mySessions'
      });
 
    // Catch errors 
    store.on('error', function(error) {
      console.log(error);
    });
    
//seperate connection to mlab for user and image info  
mongoose.Promise = global.Promise;
mongoose.connect(s3Config.mLabConnect, {useMongoClient: true}, function(){
 console.log("connected to mlab");
});
  


var routes = require('./routes');

var app = express();

//express-session setup
app.use(session({
  secret: s3Config.sessionSecret,
  store: store,
  resave: false,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

iam.configure(iamConfig);
// this must be done before routes are set up
app.use(iam.middleware());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
