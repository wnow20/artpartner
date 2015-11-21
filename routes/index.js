var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');

/* GET home page. */
exports.index = function (req, res) {
    res.render('index', {title: 'Express'});
};

exports.cms = function (req, res) {
    Model.Asdf.findById(1).then(function (asdf) {
        res.render('web/cms', {
            asdf: asdf || {}
        });
    });
};