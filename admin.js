var express = require('express');
var moment = require('moment');
var bcrypt = require('bcrypt');
var admin = express();
var userRoute = require('./routes/admin/user');

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

admin.get('/', function(req, res, next) {
    res.render('admin/admin', {
        title: '管理主页'
    });
});
admin.get('/user/list', userRoute.list);
admin.get('/user/form/(:id)?', userRoute.form);
admin.post('/user/submit', userRoute.submit);
admin.get('/user/delete/:id', userRoute.delete);

admin.use(function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.json({ error: 'Admin not Found' });
});

admin.login = userRoute.login;

module.exports = admin;