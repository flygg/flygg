var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var faye = require('faye')
var http = require('http')
var toobusy = require('toobusy');

var routes = require('./routes/index');
var users = require('./routes/users');
var channels = require('./routes/channels');
var cache = require('./routes/cache');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.post('/message', function(req, res) {
    bayeux.getClient().publish('/LHR', { text: req.body.message });
    console.log('broadcast message:' + req.body.message);
    res.status(200).end()
});

// middleware which blocks requests when we're too busy and retuns a 503
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "I'm busy right now, sorry.");
  } else {
    next();
  } 
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Development error handler which prints any stacktraces to the user
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler which prevents any stacktraces from being leaked to the user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var server = http.createServer(app)
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

cache.initialize();
channels.initialize(bayeux);
bayeux.attach(server);
server.listen(8081);

module.exports = app;