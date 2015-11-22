var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var Page = require(process.cwd() + '/lib/page');
var Promise = require("bluebird");

/* GET home page. */
exports.index = function (req, res) {
    res.render('web/index', { title: 'Art Partner' });
};

exports.tag = function (req, res, next) {
    var id = req.params.id;
    var page = Page.gen(req, res);

    Promise.all([
        Model.Tag.findAll(),
        // 查询所属分类tag的全部相册,如果tag_id为空,则查询所有
        (function(id) {
            var where = id? { tag_id: id } : {};
            return Model.Album.findAndCountAll({
                where: where,
                include: [{
                    model: Model.Photo
                }],
                offset: page.getOffset(),
                limit: page.numPerPage
            });
        }(id))
    ]).then(function (datas) {
        page.setTotalCount(datas[1].count);

        res.render('web/tag', {
            title: 'Tags - WY studio',
            tags: datas[0] || {},
            albums: datas[1].rows || {},
            page: page
        });
    }).then(null, function(err) {
        next(err);
    });
};

exports.album = function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        next();
    }

    Promise.all([
        Model.Tag.findAll(),
        Model.Album.findOne({
            where: {
                id: id
            },
            include: [{
                model: Model.Photo
            }]
        })
    ]).then(function (datas) {
        res.render('web/album', {
            tags: datas[0] || {},
            album: datas[1] || {}
        });
    });
};

exports.cms = function (req, res) {
    Model.Asdf.findById(1).then(function (asdf) {
        res.render('web/cms', {
            asdf: asdf || {}
        });
    });
};