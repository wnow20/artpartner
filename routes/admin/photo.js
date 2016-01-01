var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var utils = require(cwd + '/lib2/utils');
var Page = require(process.cwd() + '/lib/page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var fs = require('fs');
var moment = require('moment');
var sharp = require('sharp');
var Promise = require('bluebird');
var Config = require(cwd + '/lib2/config.json');
var db = require(cwd + '/lib2/db');

var PU = {
    upload_path: Config.upload_path,

    getPath: function(photo) {
        console.log(this.upload_path + photo.path)
        return this.upload_path + photo.path;
    },
    getLargePath: function(photo) {
        var zd = photo.path.substr(0, photo.path.lastIndexOf('.'));
        var ext = photo.path.substr(photo.path.lastIndexOf('.'));
        return [this.upload_path, zd, '_L', ext].join('');
    },
    getMiddlePath: function(photo) {
        var zd = photo.path.substr(0, photo.path.lastIndexOf('.'));
        var ext = photo.path.substr(photo.path.lastIndexOf('.'));
        return [this.upload_path, zd, '_M', ext].join('');
    },
    getThumbnailPath: function(photo) {
        var zd = photo.path.substr(0, photo.path.lastIndexOf('.'));
        var ext = photo.path.substr(photo.path.lastIndexOf('.'));
        return [this.upload_path, zd, '_S', ext].join('');
    },
    delete: function(photos) {
        var promiseQueue = [];
        if (!utils.isArray(photos)) {
            photos = [photos];
        }

        photos.forEach(function (photo) {
            promiseQueue.push(PU.removePhotoSync(photo));

            promiseQueue.push(PU.deleteFileSync(PU.getPath(photo)));
            promiseQueue.push(PU.deleteFileSync(PU.getLargePath(photo)));
            promiseQueue.push(PU.deleteFileSync(PU.getMiddlePath(photo)));
            promiseQueue.push(PU.deleteFileSync(PU.getThumbnailPath(photo)));
        });
        return Promise.all(promiseQueue);
    },
    removePhotoSync: function (photo) {
        return new Promise(function (resolve, reject) {
            photo.destroy().then(function (count) {
                resolve(count);
            });
        });
    },
    deleteFileSync: function (file_path) {
        return new Promise(function (resolve, reject) {
            fs.unlink(file_path, function (err) {
                err? reject(err) : resolve(file_path);
            });
        });
    }
};
exports.list = function (req, res, next) {
    var album_id = req.param('album_id');
    var page = Page.gen(req, res);
    var _photo = req.body.photo;
    var where = { album_id: +album_id };
    if (_photo) {
        if (_photo.name) {
            where.name = {
                $like: '%' + _photo.name + '%'
            };
        }
    }

    Model.Photo.findAndCountAll({
        where: where,
        include: {
            model: Model.Album
        },
        order: [
            ['id', 'ASC']
        ],
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

    Promise.all([
        Model.Album.findById(album_id),
        Model.Photo.findOne({
            where: {
                id: id
            },
            include: {
                model: Model.Album
            }
        })
    ]).then(function (datas) {
        res.render('admin/photo_form', {
            title: '照片添加/修改',
            album: datas[0] || {},
            photo: datas[1] || {}
        });
    });
};

exports.submit = function (req, res, next) {
    var _photo = req.body.photo;
    if (_photo.id) {
        Model.Photo.findById(_photo.id).then(function (photo) {
            photo.update(_photo).then(function() {
                var msg = DwzMsg.success('保存成功！');
                msg.setNavTabId('photo_list');
                msg.setForwardUrl('photo/list/' + _photo.album_id);
                msg.setCallbackType(DwzMsg.closeCurrent);

                res.json(msg);
            });
        });
        return ;
    }
};

exports.upload = function (req, res, next) {
    var album_id = req.param('album_id');
    if (req.method == 'GET') {

        Model.Album.findById(album_id).then(function(album) {
            res.render('admin/photo_upload', {
                title: '照片上传',
                album: album
            });
        });
        return ;
    }

    var _photo = req.body.photo;
    var file = req.files.file;

    var name = file.name;
    var extName = name.substring(name.lastIndexOf('.'), name.length);
    var time = moment().format('YYYYMMDD');

    var savedFilename = moment().format('YYYYMMDDHHmmss') + utils.randomString(6);
    var savedFilenameWithExt = savedFilename + extName;
    var savedParent = Config.upload_path + time + '/';
    var relativeSavedPath = time + '/' + savedFilenameWithExt;
    var savedPath = savedParent + savedFilenameWithExt;
    var uuid = utils.randomString(32);

    var original_name = savedFilename + extName;
    var large_name = savedFilename + '_L' + extName;
    var middle_name = savedFilename + '_M' + extName;
    var thumbnail_name = savedFilename + '_S' + extName;

    function genImgShot(sharpImg, width, path) {
        return new Promise(function (resolve, reject) {
            sharpImg.resize(width).toFile(path, function(err) {
                err? reject(err) : resolve(path);
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
                            _photo.path = relativeSavedPath;
                            _photo.uuid = uuid;
                            _photo.name = file.originalFilename.substr(0, file.originalFilename.lastIndexOf('.'));
                            _photo.url = '/photo/' + uuid + extName;
                            _photo.large_url = '/photo/' + uuid + '_L' + extName;
                            _photo.middle_url = '/photo/' + uuid + '_M' + extName;
                            _photo.thumbnail_url = '/photo/' + uuid + '_S' + extName;

                            Model.Photo.build(_photo).save().then(function () {
                                res.status(200).end('上传成功!');
                            }).catch(function (err) {
                                return next(err);
                            });
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

    Model.Photo.findAll({
        where: {
            id: {
                $in: ids
            }
        }
    }).then(function(photos) {
        PU.delete(photos).then(function () {
            var msg = DwzMsg.success('成功删除');
            msg.setNavTabId('photo_list');
            msg.setForwardUrl('phone/list');

            res.json(msg);

            console.log('图片删除成功!');
        })
    });
};

//exports.set_cover = function (req, res, next) {
//    var id = req.params.id;
//
//
//    var sql1 = '' +
//        'update photo t set is_cover = 0 where t.id IN (' +
//        '    select a.id from (' +
//        '        select id from photo where `album_id` IN (select album_id from photo where id = ' + id + ') and id != ' + id +
//        '    ) a' +
//        ');';
//
//    var sql2 = 'update photo set is_cover = 1 where id = ' + id;
//
//    db.sequelize.query(sql1).spread(function (results, metadata) {
//        db.sequelize.query(sql2).spread(function (results, metadata) {
//            var msg = DwzMsg.success('设置成功');
//            msg.setNavTabId('photo_list');
//            msg.setForwardUrl('phone/list');
//
//            res.json(msg);
//        });
//    })
//};