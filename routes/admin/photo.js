var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var utils = require(cwd + '/lib2/utils');
var Page = require(process.cwd() + '/lib/Page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var fs = require('fs');
var moment = require('moment');
var sharp = require('sharp');
var Promise = require("bluebird");

exports.list = function (req, res, next) {
    var album_id = req.param('album_id');
    var page = Page.gen(req, res);

    Model.Photo.findAndCountAll({
        where: {},
        include: {
            model: Model.Album
        },
        offset: page.getOffset(),
        limit: page.numPerPage
    }).then(function (result) {
        page.setTotalCount(result.count);

        Model.Album.findById(album_id).then(function (album) {
            res.render('admin/photo_list', {
                title: '图片列表',
                list: result.rows,
                album: album,
                page: page
            });
        });
    });
};

exports.form = function (req, res, next) {
    var id = req.params.id;
    var album_id = req.param('album_id');
    var photo = {};

    if (id != null) {

    } else {
        Model.Album.findById(album_id).then(function (album) {
            res.render('admin/photo_form', {
                title: '照片添加/修改',
                album: album,
                photo: photo
            });
        });
    }
};

exports.submit = function (req, res, next) {
    var _photo = req.body.photo;
    var file = req.files.file;

    if (!file) {
        return next();
    }

    var name = file.name;
    var extName = name.substring(name.lastIndexOf('.'), name.length);
    var time = moment().format('YYYYMMDD');

    var savedFilename = moment().format('YYYYMMDDHHmmss') + utils.randomString(6);
    var savedFilenameWithExt = savedFilename + extName;
    var savedParent = cwd + '/upload/' + time + '/';
    var savedPath = savedParent + savedFilenameWithExt;
    var uuid = utils.randomString(32);

    var original_name = savedFilename + extName;
    var large_name = savedFilename + '_L' + extName;
    var middle_name = savedFilename + '_M' + extName;
    var thumbnail_name = savedFilename + '_S' + extName;

    function genImgShot(sharpImg, width, path) {
        return new Promise(function (resolve, reject) {
            sharpImg.resize(width).toFile(path, function(err) {
                if (err) {
                    reject();
                } else {
                    resolve(path);
                }
            });
        });
    }

    utils.FileUtil.mkdirIfNotExists(savedParent)
        .then(function() {
            fs.rename(file.path, savedPath, function (err) {
                if (err) {
                    return next(err);
                }
                var image = sharp(savedPath);

                image
                    .metadata()
                    .then(function (metadata) {
                        var largePath = savedParent + large_name;
                        var middlePath = savedParent + middle_name;
                        var thumbnailPath = savedParent + thumbnail_name;
                        var parr = [
                            genImgShot(image, 800, largePath),
                            genImgShot(image, 600, middlePath),
                            genImgShot(image, 400, thumbnailPath),
                        ];

                        Promise.all(parr).then(function() {

                            var id = _photo.id;
                            _photo.path = savedPath;
                            _photo.uuid = uuid;
                            _photo.url = '/photo/' + uuid + extName;
                            _photo.large_url = '/photo/' + uuid + '_L' + extName;
                            _photo.middle_url = '/photo/' + uuid + '_M' + extName;
                            _photo.thumbnail_url = '/photo/' + uuid + '_S' + extName;

                            if (id) {

                            } else {
                                Model.Photo.build(_photo).save().then(function () {
                                    var msg = DwzMsg.success('保存成功！');
                                    msg.setNavTabId('photo_list');
                                    msg.setCallbackType(DwzMsg.closeCurrent);

                                    res.json(msg);
                                }).catch(function (err) {
                                    return next(err);
                                });
                            }
                        });
                    });
            });
        }, next);
};

exports.delete = function (req, res, next) {
    var ids = req.param('ids');
    if (ids.split) {
        ids = ids.split(',');
    }
    Model.Photo.destroy({
        where: {
            id: {
                $in: ids
            }
        }
    }).then(function (count) {
        var msg = DwzMsg.success('成功删除' + count + '条');
        msg.setNavTabId('photo_list');
        msg.setForwardUrl('phone/list');

        res.json(msg);
    });
};