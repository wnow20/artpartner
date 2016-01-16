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
