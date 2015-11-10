var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var utils = require(cwd + '/lib2/utils');
var Page = require(process.cwd() + '/lib/Page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var fs = require('fs');

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
        var results = photo.path.match(parttern);

        var pathSet = {
            'L': results[1] + results[2] + '_L' + results[3],
            'M': results[1] + results[2] + '_M' + results[3],
            'S': results[1] + results[2] + '_S' + results[3]
        }

        var filepath = (type && pathSet[type]) || photo.path;
        var stream = fs.createReadStream(filepath);
        stream.pipe(res);
    }).then(
        null,
        function (err) {
            console.error(err);
            res.send(404);
        }
    );
};
