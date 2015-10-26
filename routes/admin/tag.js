var Tag = require(process.cwd() + '/lib/tag');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var Page = require(process.cwd() + '/lib/Page');

exports.list = function(req, res, next) {
    var _tag = req.body.tag;
    var page = Page.gen(req, res);

    Tag.list(_tag, page, function(err, list) {
        if (err) return next(err);

        Tag.count(function(err, totalCount) {
            if (err) return next(err);
            page.totalCount = totalCount;

            res.render('admin/tag_list', {
                title: '分类列表',
                list: list,
                page: page
            });
        });
    });
}

exports.form = function(req, res, next) {
    var id = req.params.id;
    var tag = {};

    if (id != null) {
        Tag.get(id, function(err, result) {
            tag = result;

            res.render('admin/tag_form', {
                title: '分类添加/修改',
                tag: tag
            })
        });
    } else {
        res.render('admin/tag_form', {
            title: '分类添加/修改',
            tag: tag
        });
    }
}

exports.submit = function(req, res, next) {
    var _tag = req.body.tag;
    var tag = new Tag(_tag);

    tag.save(function (err, result) {
        if (err) return next(err);

        var msg = DwzMsg.success('保存成功！');
        msg.setNavTabId('tag_list');
        msg.setForwardUrl('tag/list');
        msg.setCallbackType(DwzMsg.closeCurrent);

        res.json(msg);
    });
}

exports.delete = function(req, res, next) {
    next();
}