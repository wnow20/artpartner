//var bcrypt = require('bcrypt');
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
}

exports.form = function (req, res, next) {
    var id = req.params.id;

    if (id != null) {
        Model.User.findById(id).then(function (user) {
            res.render('admin/user_form', {
                title: '用户添加/修改',
                user: user
            });
        });
    } else {
        next();
    }
}

exports.submit = function (req, res, next) {
    var _user = req.body.user;
    var id = _user.id;

    if (id) {
        Model.User.findById(id).then(function (user) {
            user.update(_user).then(function () {
                var msg = DwzMsg.success('保存成功！');
                msg.setNavTabId('user_form');
                msg.setForwardUrl(req.url);

                res.json(msg);
            });
        });
    } else {
        next();
    }
}

exports.delete = function (req, res, next) {
    var id = req.params.id;
    Model.User.findById(id).then(function (user) {
        user.destroy().then(function () {
            res.redirect('/admin/user/list');
        });
    });
}

exports.login = function (req, res, next) {
    if ('POST' === req.method) {
        var _user = req.body.user;

        Model.User.findOne({
            where: {
                username: _user.username
            }
        }).then(function (user) {
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
    } else {
        res.render('admin/login', {
            title: '登录'
        });
    }
}

exports.logout = function (req, res, next) {
    delete req.session.userid;
    delete req.session.principal;

    res.redirect('/');
}