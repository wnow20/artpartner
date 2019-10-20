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
            title: '万花筒 - Artascope',
            albums: albums
        });
    });

};

exports.tag = function (req, res, next) {
    var id = req.params.id;
    var page = Page.gen(req, res);
    page.setNumPerPage(8);

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
function findPrev(id, seq) {
    return Model.Album.findOne({
        where: {
            $or: [
                {seq: { gt: seq}},
                {seq: seq, id: { gt : id }}
            ]
        },
        order: [
            ['seq', 'ASC'],
            ['id', 'ASC']
        ]
    })
}

function findNext(id, seq) {
    return Model.Album.findOne({
        where: {
            $or: [
                {seq: { lt: seq}},
                {seq: seq, id: { lt : id }}
            ]
        },
        order: [
            ['seq', 'DESC'],
            ['id', 'DESC']
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
        })
    ]).then(function (datas) {
        var seq = datas[1] && datas[1].seq || 0;

        Promise.all([
            findPrev(id, seq),
            findNext(id, seq),
        ]).then(function (results) {
            res.render('web/album', {
                tags: datas[0] || {},
                album: datas[1] || {},
                title: datas[1] && datas[1].name,
                prevAlbum: results[0] || {},
                nextAlbum: results[1] || {}
            });
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