var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var utils = require(cwd + '/lib2/utils');
var Page = require(process.cwd() + '/lib/page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var fs = require('fs');
var Config = require(cwd + '/lib2/config.json');
var mime = require('mime');
var zlib = require('zlib');

exports.index = function (req, res, next) {
    var uuid_type_ext = req.params.uuid_type_ext;
    var pms = uuid_type_ext.split(/_|\./);
    var uuid = pms[0];
    var type = pms[2] && pms[1];
    var ext = pms[2] || pms[1];

    Model.Photo.findOne({
        where: {
            uuid: uuid
        }
    }).then(function(photo) {
        if (!photo) {
            throw new Error('图片不存在');
        }
        var parttern = /(.+\/)(.{20})(\..+)/;
        var results = (Config.upload_path + photo.path).match(parttern);

        var pathSet = {
            'L': results[1] + results[2] + '_L' + results[3],
            'M': results[1] + results[2] + '_M' + results[3],
            'S': results[1] + results[2] + '_S' + results[3]
        }

        var filepath = (type && pathSet[type]) || Config.upload_path + photo.path;
        fs.stat(filepath, function (err, stats) {
            if (err) {
                return res.send(404);
            }

            var lastModified = (new Date(stats.mtime)).toUTCString();
            var acceptEncoding = req.headers['accept-encoding'] || "";

            res.statusCode = 200;
            if (req.headers["If-Modified-Since".toLowerCase()] == lastModified) {
                res.statusCode = 304;
                res.end();
                return;
            }

            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Type', mime.lookup(filepath));
            res.setHeader('last-modified', lastModified);
            res.setHeader("Expires", (new Date((new Date()).getTime() + 60 * 60 * 24 * 30 * 1000)).toUTCString());
            res.setHeader("Cache-Control", "max-age=" + (60 * 60 * 24 * 30 * 1000));

            var stream = fs.createReadStream(filepath);

            if (acceptEncoding.match(/\bgzip\b/)) {
                res.setHeader('Content-Encoding', 'gzip');
                stream = stream.pipe(zlib.createGzip());
            } else if (acceptEncoding.match(/\bdeflate\b/)) {
                res.setHeader('Content-Encoding', 'deflate');
                stream = stream.pipe(zlib.createDeflate());
            }

            stream.pipe(res);
        });
    });
};
