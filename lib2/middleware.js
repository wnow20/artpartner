var cwd = process.cwd();
var Model = require(cwd + '/lib2/model');

exports.genCache = function(app) {
    return function (req, res, next) {
        app.cache = app.cache || {};
        //if (app.cache.topnav) {
        //    app.locals.topnav = app.cache.topnav;
        //
        //    return next();
        //}

        Model.Tag.findAll({
            where: {
                is_topnav: 1
            }
        }).then(function (tags) {
            app.cache.topnav = tags;
            app.locals.topnav = app.cache.topnav;

            return next();
        }, function (err) {
            return next(err);
        });
    }
};