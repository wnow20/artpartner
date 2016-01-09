var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var Page = require(process.cwd() + '/lib/page');
var Promise = require("bluebird");

/* GET home page. */
exports.index = function (req, res) {
    Model.Album.findAll({
        include: [{
            model: Model.Photo
        }],
        order: [
            ['seq', 'ASC'],
            ['id', 'DESC'],
        ],
        limit: 20
    }).then(function (albums) {
        res.render('web/index', {
            title: 'HOME - WANGYI',
            albums: albums
        });
    });

};

exports.tag = function (req, res, next) {
    var id = req.params.id;
    var page = Page.gen(req, res);

    Promise.all([
        Model.Tag.findAll(),
        // 查询所属分类tag的全部相册,如果tag_id为空,则查询所有
        (function(id) {
            var where = id? { tag_id: id } : {};
            return Model.Album.findAll({
                where: where,
                include: [{
                    model: Model.Photo
                }],
                order: [
                    ['id', 'DESC'],
                ]
                //offset: page.getOffset(),
                //limit: page.numPerPage
            });
        }(id))
    ]).then(function (datas) {
        page.setTotalCount(datas[1].count);

        res.render('web/tag', {
            title: datas[0] && datas[0].name,
            tags: datas[0] || {},
            albums: datas[1] || {},
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
            order: [
                [Model.Photo, 'seq', 'ASC'],
                [Model.Photo, 'id', 'ASC']
            ],
            include: [{
                model: Model.Photo
            }]
        }),
    ]).then(function (datas) {
        res.render('web/album', {
            tags: datas[0] || {},
            album: datas[1] || {},
            title: datas[1] && datas[1].name
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