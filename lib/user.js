var db = require('./db.js');

module.exports = User;

function User(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
}

User.prototype.get = function(fn) {
    db.query('SELECT * FROM user WHERE id = ?', this.id, function(err, rows) {
        if (err) return fn(err);

        var _user = rows[0];
        fn(null, new User(_user));
    });
}

User.getByUsername = function(username, fn) {
    db.query('SELECT * FROM user WHERE username = ?', username, function(err, rows) {
        if (err) return fn(err);

        var _user = rows[0];
        fn(null, new User(_user));
    });
}

User.get = function(id, fn) {
    db.query('SELECT * FROM user WHERE id = ?', id, function(err, rows) {
        if (err) return fn(err);

        var _user = rows[0];
        fn(null, new User(_user));
    });
}

User.prototype.save = function (fn) {
    if (this.id) {
        this.update(fn);
    } else {
        freshTime(this);
        delete this.id;
        db.query('INSERT INTO user SET ?', this, function (err, result) {
            fn(err, result);
        });
    }
}

User.prototype.update = function(fn) {
    db.query("UPDATE user SET ? where id = ?", [this, this.id], function (err, result) {
        fn(err, result);
    });
}

User.prototype.delete = function(fn) {
    db.query("DELETE FROM user where id = ?", this.id, function (err, result) {
        fn(err, result.affectedRows);
    });
}

User.delete = function(id, fn) {
    var query = db.query("DELETE FROM user where id = ?", id, function (err, result) {
        fn(err, result.affectedRows);
    });
}

User.list = function(fn) {
    db.query('SELECT * FROM user', function(err, rows) {
        if (err) throw fn(err);

        var list = new Array();
        rows.forEach(function(row) {
            list.push(new User(row));
        });

        fn(null, list);
    });
}

User.prototype.deleteAll = function (fn) {
    db.query("DELETE FROM user WHERE 1=1", function (err, result) {
        fn(err, result.affectedRows);
    });
}

User.prototype.truncate = function (fn) {
    db.query("truncate user", function (err, result) {
        fn(err, result);
    });
}

User.prototype.count = function(fn) {
    db.query('SELECT COUNT(*) AS count FROM user', function (err, rows) {
        if (err) return fn(err);
        fn(err, rows[0].count);
    });
}


var freshTime = function(user) {
    if (!user.create_time)
        user.create_time = new Date();

    user.update_time = new Date();
}