var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');
var Page = require(process.cwd() + '/lib/page');
var utils = require(cwd + '/lib2/utils');
var Promise = require("bluebird");

/* GET home page. */
exports.index = function (req, res) {
    var limit = utils.isMobile(req.header("User-Agent")) ? 10 : 20;

    Model.Album.findAll({
        include: [{
            model: Model.Photo
        }],
        order: [
            ['seq', 'DESC'],
            ['id', 'DESC'],
        ],
        limit: limit,
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
    page.setNumPerPage(10);

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
                order: [
                    ['seq', 'DESC'],
                    ['id', 'DESC'],
                ],
                offset: page.getOffset(),
                limit: page.numPerPage
            });
        }(id))
    ]).then(function (datas) {
        page.setTotalCount(datas[1].count);

        res.render('web/tag', {
            title: datas[0] && datas[0].name,
            tags: datas[0] || {},
            albums: datas[1].rows || [],
            page: page
        });
    }).then(null, function(err) {
        next(err);
    });
};
function findPrev(id) {
    return Model.Album.findOne({
        where: {
            id: {
                lt: id
            }
        },
        order: [
            ['id', 'DESC']
        ]
    })
}

function findNext(id) {
    return Model.Album.findOne({
        where: {
            id: {
                gt: id
            }
        },
        order: [
            ['id', 'ASC']
        ]
    })
}

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
        findPrev(id),
        findNext(id),
    ]).then(function (datas) {
        res.render('web/album', {
            tags: datas[0] || {},
            album: datas[1] || {},
            title: datas[1] && datas[1].name,
            prevAlbum: datas[2] || {},
            nextAlbum: datas[3] || {}
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