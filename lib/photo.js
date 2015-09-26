var db = require('./db.js');
module.exports = Photo;

//select `id`, `create_time`, `update_time`, `del_flag`, `title`, `thumbnail_url`, `middle_url`, `large_url`, `url` from photo
var columns = ['id', 'create_time', 'update_time', 'del_flag', 'title', 'thumbnail_url', 'middle_url', 'large_url', 'url'];

function Photo(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

Photo.prototype.save = function (fn) {
    if (this.id) {
        this.update(fn);
    } else {
        db.query('INSERT INTO photo SET ?', this, function (err, result) {
            fn(err, result.insertId);
        });
    }
}

Photo.prototype.update = function (fn) {
    db.query("UPDATE photo SET title = :title where id = :id", this, function (err, result) {
        fn(err, result);
    });
}

Photo.prototype.get = function (id, fn) {
    var that = this;
    db.query('SELECT * FROM photo WHERE id = ?', id, function(err, rows) {
        if (err) return fn(err);

        var photo = rows[0];

        Photo.call(that, photo);

        fn();
    });
}

Photo.prototype.list = function (page, fn) {

}

Photo.prototype.delete = function (fn) {
    db.query("DELETE FROM photo where id = ?", this.id, function (err, result) {
        fn(err, result.affectedRows);
    });
}

Photo.prototype.deleteAll = function (fn) {
    db.query("DELETE FROM photo WHERE 1=1", function (err, result) {
        fn(err, result.affectedRows);
    });
}

Photo.prototype.truncate = function (fn) {
    db.query("truncate photo", function (err, result) {
        fn(err, result);
    });
}

Photo.prototype.count = function(fn) {
    db.query('SELECT COUNT(*) AS count FROM photo', function (err, rows) {
        if (err) return fn(err);
        fn(err, rows[0].count);
    });
}