var express = require('express');
var moment = require('moment');
//var bcrypt = require('bcrypt');
var admin = express();
var userRoute = require('./routes/admin/user');
var tagRoute = require('./routes/admin/tag');

admin.locals.moment = moment;

var res = express.response;
res.message = function (msg, type) {
    type = type || 'info';
    var sess = this.req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({type: type, string: msg});
};

admin.use(function(req,res,next){
    res.locals.messages= req.session.messages|| [];
    res.locals.removeMessages= function(){
        req.session.messages= [];
    };
    next();
});

admin.use(function(req, res, next) {
    res.locals.principal = req.session ? req.session.principal : {};
    next();
});

admin.get('/index', function(req, res, next) {
    res.render('admin/admin', {
        title: '管理主页'
    });
});
admin.all('/user/list', userRoute.list);
admin.all('/user/form/(:id)?', userRoute.form);
admin.post('/user/submit', userRoute.submit);
admin.all('/user/delete/:id', userRoute.delete);

admin.all('/tag/list', tagRoute.list);
admin.all('/tag/form/(:id)?', tagRoute.form);
admin.post('/tag/submit', tagRoute.submit);
admin.all('/tag/delete/:id', tagRoute.delete);

admin.use(function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.json({ error: 'Admin not Found' });
});

admin.login = userRoute.login;
admin.logout = userRoute.logout;

module.exports = admin;