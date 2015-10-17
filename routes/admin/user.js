//var bcrypt = require('bcrypt');
var User = require(process.cwd() + '/lib/user');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');

exports.list = function(req, res, next) {
    User.list(function(err, list) {
        if (err) return next(err);

        res.render('admin/user_list', {
            title: '用户列表',
            list: list
        });
    });
}
exports.form = function(req, res, next) {
    var id = req.params.id;
    var user = {};

    if (id != null) {
        User.get(id, function(err, result) {
            user = result;

            res.render('admin/user_form', {
                title: '用户添加/修改',
                user: user
            });
        });
    } else {
        res.render('admin/user_form', {
            title: '用户添加/修改',
            user: user
        });
    }

}

exports.submit = function(req, res, next) {
    var _user = req.body.user;
    var user = new User(_user);

    user.save(function (err, result) {
        if (err) return next(err);

        var msg = DwzMsg.success('保存成功！');
        msg.setNavTabId('user_form');
        msg.setForwardUrl(req.url);

        res.json(msg);
    });


    //bcrypt.genSalt(10, function(err, salt) {
    //    user.salt = salt;
    //    bcrypt.hash(user.password, salt, function(err, hash) {
    //        user.password = hash;
    //
    //        user.save(function(err, result) {
    //            if (err) return next(err);
    //
    //            res.redirect('/admin/user/list');
    //        });
    //    });
    //});
}

exports.delete = function(req, res, next) {
    var id = req.params.id;

    User.delete(id, function(err, count) {
        if (err) return next(err);

        res.redirect('/admin/user/list');
    })

}

exports.login = function(req, res, next) {
    if ('POST' === req.method) {
        var _user = req.body.user;
        User.getByUsername(_user.username, function(err, user) {
            var redirect = req.query.redirect;
            if (_user.password === user.password) {
                req.session.userid = user.id;
                req.session.principal = user;
                if (redirect) {
                    res.redirect(decodeURIComponent(redirect));
                } else {
                    res.redirect('/admin/index');
                }
            } else {
                res.message('账号或密码错误！', 'error');
                res.redirect('/login');
            }
        });

        //bcrypt.compare(_user.password, user.password, function(err, res) {
        //    var url = '/login?redirect=' + redirect;
        //    if (res) {
        //        req.session.userid = user.id;
        //        if (redirect) {
        //            res.redirect(decodeURIComponent(redirect));
        //        } else {
        //            res.redirect('/admin');
        //        }
        //        res.redirect(url);
        //    } else {
        //        res.message('账号或密码错误！', 'error');
        //        res.redirect(url);
        //    }
        //});
    } else {
        res.render('admin/login', {
            title: '登录'
        });
    }
}

exports.logout = function(req, res, next) {
    delete req.session.userid;
    delete req.session.principal;

    res.redirect('/');
}