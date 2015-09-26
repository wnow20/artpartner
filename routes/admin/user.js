var bcrypt = require('bcrypt');
var User = require(process.cwd() + '/lib/user');

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

    bcrypt.genSalt(10, function(err, salt) {
        user.salt = salt;
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;

            user.save(function(err, result) {
                if (err) return next(err);

                res.redirect('/admin/user/list');
            });
        });
    });
}

exports.delete = function(req, res, next) {
    var id = req.params.id;

    User.delete(id, function(err, count) {
        if (err) return next(err);

        res.redirect('/admin/user/list');
    })

}

exports.login = function(req, res, next) {
    console.log('req.method');
    console.log(req.method);
    if ('POST' === req.method) {
        var _user = req.body.user;
        var user = User.getByUsername(_user.username);
        var redirect = req.query.redirect;
        bcrypt.compare(_user.password, user.password, function(err, res) {
            var url = '/login?redirect=' + redirect;
            if (res) {
                req.session.userid = user.id;
                if (redirect) {
                    res.redirect(decodeURIComponent(redirect));
                } else {
                    res.redirect('/admin');
                }
                res.redirect(url);
            } else {
                res.message('账号或密码错误！', 'error');
                res.redirect(url);
            }
        });
    } else {
        res.render('admin/login', {
            title: '登录'
        });
    }
}