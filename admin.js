var express = require('express');
var moment = require('moment');
//var bcrypt = require('bcrypt');
var admin = express();
var userRoute = require('./routes/admin/user');
var tagRoute = require('./routes/admin/tag');
var albumRoute = require('./routes/admin/album');
var photoRoute = require('./routes/admin/photo');
var asdfRoute = require('./routes/admin/asdf');

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
admin.all('/user/delete/(:id)?', userRoute.delete);

admin.all('/tag/list', tagRoute.list);
admin.all('/tag/form/(:id)?', tagRoute.form);
admin.post('/tag/submit', tagRoute.submit);
admin.all('/tag/delete/(:id)?', tagRoute.delete);

admin.all('/album/list', albumRoute.list);
admin.all('/album/form/(:id)?', albumRoute.form);
admin.post('/album/submit', albumRoute.submit);
admin.all('/album/delete/(:id)?', albumRoute.delete);
admin.all('/album/(:id)/cover', albumRoute.cover);
admin.all('/album/cover/', albumRoute.cover);
admin.all('/album/cover/upload', albumRoute.cover_upload);
admin.all('/album/cover/crop', albumRoute.cover_crop);

admin.all('/photo/list/(:album_id)?', photoRoute.list);
admin.all('/photo/form/(:id)?', photoRoute.form);
admin.all('/photo/upload', photoRoute.upload);
admin.all('/photo/submit', photoRoute.submit);
admin.all('/photo/delete/(:id)?', photoRoute.delete);
admin.all('/photo/set_cover/(:id)?', photoRoute.set_cover);

// 公示,关于我,联系的管理
admin.all('/asdf/form/:type', asdfRoute.form);
admin.all('/asdf/submit', asdfRoute.submit);

admin.use(function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.json({ error: 'Admin not Found' });
});
admin.use(function(err, req, res, next) {
    console.error(err);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.json({ error: 'Admin Error' });
});

admin.login = userRoute.login;
admin.login_dialog = userRoute.login_dialog;
admin.logout = userRoute.logout;

module.exports = admin;