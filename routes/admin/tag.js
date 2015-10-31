var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var Page = require(process.cwd() + '/lib/Page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');

exports.list = function (req, res, next) {
    var page = Page.gen(req, res);
    Model.Tag.findAndCountAll({
        where: {},
        offset: page.getOffset(),
        limit: page.numPerPage
    }).then(function (result) {
        page.setTotalCount(result.count);
        result.rows.forEach(function (i) {
            console.log(i.dataValues);
        });
        res.render('admin/tag_list', {
            title: '分类列表',
            list: result.rows,
            page: page
        });
    });
};

exports.form = function (req, res, next) {
    var id = req.params.id;
    var tag = {};

    if (id != null) {
        Model.Tag.findById(id).then(function (tag) {
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

exports.submit = function (req, res, next) {
    var _tag = req.body.tag;
    var id = _tag.id;

    if (id) {
        Model.Tag.findById(id).then(function (tag) {
            tag.update(_tag).then(function() {
                var msg = DwzMsg.success('保存成功！');
                msg.setNavTabId('tag_list');
                msg.setForwardUrl('tag/list');
                msg.setCallbackType(DwzMsg.closeCurrent);

                res.json(msg);
            });
        });
    } else {
        Model.Tag.build(_tag).save().then(function () {
            var msg = DwzMsg.success('保存成功！');
            msg.setNavTabId('tag_list');
            msg.setForwardUrl('tag/list');
            msg.setCallbackType(DwzMsg.closeCurrent);

            res.json(msg);
        }).catch(function (err) {
            return next(err);
        });
    }
};

exports.delete = function (req, res, next) {
    var ids = req.param('ids');
    if (ids.split) {
        ids = ids.split(',');
    }
    Model.Tag.destroy({
        where: {
            id: {
                $in: ids
            }
        }
    }).then(function (count) {
        var msg = DwzMsg.success('成功删除' + count + '条');
        msg.setNavTabId('tag_list');
        msg.setForwardUrl('tag/list');

        res.json(msg);
    });
};