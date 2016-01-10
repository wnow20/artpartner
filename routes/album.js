var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var utils = require(cwd + '/lib2/utils');
var Page = require(process.cwd() + '/lib/page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var fs = require('fs');
var Config = require(cwd + '/lib2/config.json');

exports.index = function (req, res, next) {
    var uuid_ext = req.params.uuid_ext;
    var pms = uuid_ext.split(/\./);
    var uuid = pms[0];
    var ext = pms[1];

    Model.Album.findOne({
        where: {
            uuid: uuid
        }
    }).then(function(album) {
        if (!album) {
            throw new Error('封面不存在');
        }

        var filepath = Config.upload_path + 'cover/' + uuid_ext;
        fs.exists(filepath, function (exists) {
            if (exists) {
                var stats = fs.statSync(filepath);

                res.setHeader('Last-Modified', stats.mtime);
                res.setHeader('Cache-Control', 'public, max-age=0');
                res.setHeader('X-Powered-By', 'Express');

                var stream = fs.createReadStream(filepath);
                stream.pipe(res);
            } else {
                console.error(new Error('File not found. path: ' + filepath));

                res.send(404);
            }
        });
    });
};
exports.temp = function (req, res, next) {
    var uuid_ext = req.params.uuid_ext;
    var pms = uuid_ext.split(/\./);
    var uuid = pms[0];
    var ext = pms[1];

    Model.Album.findOne({
        where: {
            uuid: uuid
        }
    }).then(function(album) {
        if (!album) {
            throw new Error('封面不存在');
        }

        var filepath = Config.upload_path + 'temp/' + uuid_ext;
        fs.exists(filepath, function (exists) {
            if (exists) {
                var stream = fs.createReadStream(filepath);
                stream.pipe(res);
            } else {
                console.error(new Error('File not found. path: ' + filepath));

                res.send(404);
            }
        });
    });
};
