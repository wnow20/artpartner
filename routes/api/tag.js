var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var Page = require(process.cwd() + '/lib/page');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');

exports.tag = function (req, res, next) {
    var id = req.params.id;
    var page = Page.gen(req, res);

    var where = id? { tag_id: id } : {};
    return Model.Album.findAndCountAll({
        where: where,
        include: [{
            model: Model.Photo
        }],
        order: [
            ['seq', 'DESC'],
            ['id', 'DESC'],
        ],
        offset: page.getOffset(),
        limit: page.numPerPage
    }).then(function (result) {
        page.setTotalCount(result.count);
        res.json(result.rows);
    }).catch(function (err) {
        return next(err);
    });
};
