var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');
var DwzMsg = require(process.cwd() + '/lib/DwzMsg');

exports.form = function (req, res, next) {
    var type = req.param('type');

    Model.Asdf.findById(1).then(function (asdf) {
        console.log(asdf);
        res.render('admin/asdf_edit', {
            title: '分类添加/修改',
            asdf: asdf,
            type: type
        })
    });
};

exports.submit = function (req, res, next) {
    var _asdf = req.body.asdf;
    Model.Asdf.findById(1).then(function (asdf) {
        asdf.update(_asdf).then(function() {
            var msg = DwzMsg.success('保存成功！');
            msg.setNavTabId('asdf_form');

            res.json(msg);
        });
    });
};