var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var moment = require('moment');
var admin = require('./admin');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var cwd = process.cwd();
var middleware = require(process.cwd() + '/lib2/middleware');

var res = express.response;
res.message = function (msg, type) {
    type = type || 'info';
    var sess = this.req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({type: type, string: msg});
};

var routes = require('./routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: cwd +'/tmp' }));
app.use(cookieParser());
app.use(session({
    name: 'sid',
    secret: 'whosyourdaddy',
    resave: false,
    saveUninitialized: false,
}));

app.locals.moment = moment;

app.use(function (req, res, next) {
    res.locals.messages = req.session.messages || [];
    res.locals.removeMessages = function () {
        req.session.messages = [];
    };
    next();
});

app.use(middleware.genCache(app));

app.use(app.router);

app.use('/admin', function(req, res, next) {
    if (!req.session.userid) {
        if (req.xhr) {
            var msg = new DwzMsg(DwzMsg.TIMEOUT, '登陆超时,请重新登陆!');
            return res.json(msg);
        } else {
            var redirect = encodeURIComponent(req.url);
            return res.redirect('/login?redirect=' + redirect);
        }
    }
    next();
});
app.use('/admin', admin);
app.all('/login', admin.login);
app.all('/login_dialog', admin.login_dialog);
app.all('/logout', admin.logout);
app.get('/photo/:uuid_type_ext', require('./routes/photo').index);
app.get('/album/cover/:uuid_ext', require('./routes/album').index);
app.get('/album/cover/temp/:uuid_ext', require('./routes/album').temp);

app.get('/', routes.index);
app.get('/tag/(:id)?', routes.tag);
app.get('/album/(:id)?', routes.album);
app.get('/cms', routes.cms);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
