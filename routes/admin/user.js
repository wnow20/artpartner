var bcrypt = require('bcrypt');
var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var Page = require(process.cwd() + '/lib/Page');
var DwzMsg = require(cwd + '/lib/DwzMsg');

exports.list = function (req, res, next) {
    var page = Page.gen(req, res);
    Model.User.findAndCountAll({
        where: {},
        offset: page.getOffset(),
        limit: page.numPerPage
    }).then(function (result) {
        page.setTotalCount(result.count);
        res.render('admin/user_list', {
            title: '用户列表',
            list: result.rows,
            page: page
        });
    });
};

exports.form = function (req, res, next) {
    var id = req.params.id;
    var user = {};

    if (id != null) {
        Model.User.findById(id).then(function (user) {
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
};

exports.submit = function (req, res, next) {
    var _user = req.body.user;
    var id = _user.id;

    if (id) {
        Model.User.findById(id).then(function (user) {
            if (_user.password) {
                _user.password = bcrypt.hashSync(_user.password, user.salt);
            } else {
                delete _user.password;
            }
            user.update(_user).then(function () {
                var msg = DwzMsg.success('保存成功！');
                msg.setNavTabId('user_form');
                msg.setForwardUrl(req.url);

                res.json(msg);
            });
        });
    } else {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return next(err);
            }
            _user.salt = salt;
            bcrypt.hash(_user.password, salt, function(err, hash) {
                _user.password = hash;

                Model.User.build(_user).save().then(function () {
                    var msg = DwzMsg.success('保存成功！');
                    msg.setNavTabId('user_form');
                    msg.setForwardUrl(req.url);

                    res.json(msg);
                }).catch(function (err) {
                    return next(err);
                });
            });

        });
    }
};

exports.delete = function (req, res, next) {
    var id = req.params.id;
    Model.User.findById(id).then(function (user) {
        user.destroy().then(function () {
            res.redirect('/admin/user/list');
        });
    });
};

exports.login = function (req, res, next) {
    if ('POST' !== req.method) {
        res.render('admin/login', {
            title: '登录'
        });
        return;
    }
    var _user = req.body.user;
    Model.User.findOne({
        where: {
            username: _user.username
        }
    }).then(function (user) {
        var redirect = req.query.redirect;
        var salt = user.salt;
        bcrypt.hash(_user.password, salt, function(err, hash) {
            if (hash === user.password) {
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
    });
};

exports.login_dialog = function(req, res, next) {
    if ('POST' !== req.method) {
        res.render('admin/login_dialog', {
            title: '登录'
        });
        return;
    }

    var _user = req.body.user;
    Model.User.findOne({
        where: {
            username: _user.username
        }
    }).then(function (user) {
        var redirect = req.query.redirect;
        var salt = user.salt;
        bcrypt.hash(_user.password, salt, function(err, hash) {
            var msg = DwzMsg.success('登陆成功！');
            if (hash === user.password) {
                req.session.userid = user.id;
                req.session.principal = user;
                msg.setCallbackType(DwzMsg.closeCurrent);
            } else {
                msg = DwzMsg.error('登陆失败!');
            }
            res.json(msg);
        });
    });
};

exports.logout = function (req, res, next) {
    delete req.session.userid;
    delete req.session.principal;

    res.redirect('/');
};