var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var Page = require(process.cwd() + '/lib/Page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');

exports.list = function (req, res, next) {
    var page = Page.gen(req, res);
    Model.Album.findAndCountAll({
        where: {},
        include: {
            model: Model.Tag
        },
        offset: page.getOffset(),
        limit: page.numPerPage
    }).then(function (result) {
        page.setTotalCount(result.count);

        Model.Tag.findAll({
            where: {}
        }).then(function (tags) {
            res.render('admin/album_list', {
                title: '分类列表',
                list: result.rows,
                tags: tags,
                page: page
            });
        });
    });
};

exports.form = function (req, res, next) {
    var id = req.params.id;
    var album = {};

    Model.Tag.findAll({
        where: {}
    }).then(function (tags) {
        if (id != null) {
            Model.Album.findById(id).then(function (album) {
                res.render('admin/album_form', {
                    title: '分类添加/修改',
                    album: album,
                    tags: tags
                })
            });
        } else {
            res.render('admin/album_form', {
                title: '分类添加/修改',
                album: album,
                tags: tags
            });
        }
    });
};

exports.submit = function (req, res, next) {
    var _album = req.body.album;
    var id = _album.id;

    if (id) {
        Model.Album.findById(id).then(function (album) {
            album.update(_album).then(function() {
                var msg = DwzMsg.success('保存成功！');
                msg.setNavTabId('album_list');
                msg.setForwardUrl('album/list');
                msg.setCallbackType(DwzMsg.closeCurrent);

                res.json(msg);
            });
        });
    } else {
        Model.Album.build(_album).save().then(function () {
            var msg = DwzMsg.success('保存成功！');
            msg.setNavTabId('album_list');
            msg.setForwardUrl('album/list');
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
    Model.Album.destroy({
        where: {
            id: {
                $in: ids
            }
        }
    }).then(function (count) {
        var msg = DwzMsg.success('成功删除' + count + '条');
        msg.setNavTabId('album_list');
        msg.setForwardUrl('album/list');

        res.json(msg);
    });
};