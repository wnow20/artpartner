var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var utils = require(cwd + '/lib2/utils');
var Page = require(process.cwd() + '/lib/page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var fs = require('fs');
var Config = require(cwd + '/lib2/config.json');

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
