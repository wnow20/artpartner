var db = require('./db.js');

module.exports = Tag;

function Tag(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

Tag.prototype.get = function(fn) {
    db.query('SELECT * FROM tag WHERE id = ?', id, function(err, rows) {
        if (err) return fn(err);

        var _tag = rows[0];
        fn(null, new Tag(_tag));
    });
}

Tag.get = function(id, fn) {
    db.query('SELECT * FROM tag WHERE id = ?', id, function(err, rows) {
        if (err) return fn(err);

        var _tag = rows[0];
        fn(null, new Tag(_tag));
    });
}

Tag.prototype.save = function (fn) {
    if (this.id) {
        this.update(fn);
    } else {
        freshTime(this);
        delete this.id;
        db.query('INSERT INTO tag SET ?', this, function (err, result) {
            fn(err, result);
        });
    }
}

Tag.prototype.update = function(fn) {
    db.query("UPDATE tag SET ? where id = ?", [this, this.id], function (err, result) {
        fn(err, result);
    });
}

Tag.prototype.delete = function(fn) {
    db.query("DELETE FROM tag where id = ?", this.id, function (err, result) {
        fn(err, result.affectedRows);
    });
}

Tag.delete = function(id, fn) {
    var query = db.query("DELETE FROM tag where id = ?", id, function (err, result) {
        fn(err, result.affectedRows);
    });
}

Tag.list = function(tag, page, fn) {
    var sql = 'SELECT * FROM tag LIMIT ' + page.toLimitStr();

    tag = tag || {};
    if (tag && tag.name) {
        sql += ' where name like ?';
        tag.name = '%' + tag.name + '%';
    }

    console.log('sql: ' + sql);
    console.log(tag.name);
    db.query(sql, tag.name, function(err, rows) {
        if (err) throw fn(err);

        var list = new Array();
        rows.forEach(function(row) {
            list.push(new Tag(row));
        });

        fn(null, list);
    });
}

Tag.prototype.deleteAll = function (fn) {
    db.query("DELETE FROM tag WHERE 1=1", function (err, result) {
        fn(err, result.affectedRows);
    });
}

Tag.prototype.truncate = function (fn) {
    db.query("truncate tag", function (err, result) {
        fn(err, result);
    });
}

Tag.count = function(fn) {
    db.query('SELECT COUNT(*) AS count FROM tag', function (err, rows) {
        if (err) return fn(err);
        fn(err, rows[0].count);
    });
}


var freshTime = function(tag) {
    if (!tag.create_time)
        tag.create_time = new Date();

    tag.update_time = new Date();
}