var cwd = process.cwd();
var utils = require(cwd + '/lib2/utils');
var Model = require(cwd + '/lib2/model');
var Page = require(process.cwd() + '/lib/page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var Config = require(cwd + '/lib2/config.json');
var fs = require('fs');
var sharp = require('sharp');

var PU = {
    upload_path: Config.upload_path,
    delete: function (album) {
        var tempFile = PU.upload_path + 'temp/' + album.cover.substr(album.cover.lastIndexOf('/') + 1);
        var coverFile = PU.upload_path + 'cover/' + album.cover.substr(album.cover.lastIndexOf('/') + 1);

        fs.existsSync(tempFile) && fs.unlinkSync(tempFile);
        fs.existsSync(coverFile) && fs.unlinkSync(coverFile);
    },
};
exports.list = function (req, res, next) {
    var page = Page.gen(req, res);
    var _album = req.body.album || {};
    var where = {};
    if (_album) {
        if (_album.name) {
            where.name = {
                $like: '%' + _album.name + '%'
            }
        }
        if (_album.tag_id) {
            where.tag_id = _album.tag_id = +_album.tag_id;
        }
    }
    Model.Album.findAndCountAll({
        where: where,
        include: {
            model: Model.Tag
        },
        order: 'id desc',
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
                page: page,
                album: _album
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
                });
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

exports.cover = function (req, res, next) {
    var id = req.params.id;

    Model.Album.findById(id).then(function (album) {
        res.render('admin/album_cover', {
            title: '设置封面',
            album: album,
        })
    });
};

exports.cover_upload = function (req, res, next) {
    var album_id = req.param('album_id');
    var file = req.files.file;

    var name = file.name;
    var extName = name.substring(name.lastIndexOf('.'), name.length);
    var savedParent = Config.upload_path + 'temp/';

    var uuid = utils.randomString(32);
    var savedPath = [savedParent, uuid, extName].join('');;

    Model.Album.findById(album_id).then(function (album) {
        if (!album) {
            return next();
        }
        if (album.uuid) {
            PU.delete(album);
        }

        utils.FileUtil.mkdirIfNotExists(savedParent)
            .then(function () {
                return sharp(file.path).toFile(savedPath);
            }).then(function () {
                var cover = '/album/cover/temp/' + uuid + extName;
                var _album = {
                    cover: cover,
                    uuid: uuid,
                };
                album.update(_album).then(function (err, data) {
                    res.json({success: true, message: '上传成功!', data: {cover: cover, uuid: uuid}});
                });
            }, function (err) {
                return next(err);
            });
    });
};
exports.cover_crop = function (req, res, next) {
    var uuid = req.body.uuid;
    var x = req.body.x * 1;
    var y = req.body.y * 1;
    var w = req.body.w * 1;
    var h = req.body.h * 1;
    var _album = null;
    var filepath = null;
    var cropedPath = null;
    var filename = null;
    var cropedUrl = null;

    Model.Album.findOne({
        where: {
            uuid: uuid
        }
    }).then(function (album) {
        if (!album) {
            return next();
        }
        _album = album;

        filename = album.cover.substr(album.cover.lastIndexOf('/') + 1);
        filepath = PU.upload_path + 'temp/' + filename;
        cropedPath = PU.upload_path + 'cover/' + filename;
        cropedUrl = '/album/cover/' + filename;

        fs.exists(cropedPath, function (exists) {
            if (exists) {
                fs.unlink(cropedPath, function () {
                    return sharp(filepath).extract(y,x,w,h).toFile(cropedPath);
                });
            } else {
                return sharp(filepath).extract(y,x,w,h).toFile(cropedPath);
            }
        });


    }).then(function() {
        return _album.update({cover: cropedUrl});
    }).then(function () {
        var msg = DwzMsg.success('裁切成功!');
        msg.setNavTabId('album_list');
        msg.setForwardUrl('album/list');
        msg.setCallbackType(DwzMsg.closeCurrent);

        res.json(msg);
    }).then(null, function (err) {
        return next(err);
    });


};