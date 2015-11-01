var Sequelize = require('sequelize');
var db = require('./db');

var User = db.sequelize.define('user', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    username: { type: Sequelize.STRING },
    nickname: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    salt: { type: Sequelize.STRING },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false }
}, {
    tableName: 'user'
});

var Tag = db.sequelize.define('tag', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    name: { type: Sequelize.STRING },
    intro: { type: Sequelize.STRING },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false }
}, {
    tableName: 'tag'
});

var Photo = db.sequelize.define('photo', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    name: { type: Sequelize.STRING },
    intro: { type: Sequelize.STRING },
    url: { type: Sequelize.STRING },
    large_url: { type: Sequelize.STRING },
    middle_url: { type: Sequelize.STRING },
    thumbnail_url: { type: Sequelize.STRING },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false }
}, {
    tableName: 'photo'
});

var Asdf = db.sequelize.define('asdf', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    notice: { type: Sequelize.STRING },
    contact: { type: Sequelize.STRING },
    aboutus: { type: Sequelize.STRING }
}, {
    tableName: 'asdf'
});

var Album = db.sequelize.define('album', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    name: { type: Sequelize.STRING },
    intro: { type: Sequelize.STRING },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false }
}, {
    tableName: 'album'
});

exports.User = User;
exports.Asdf = Asdf;

exports.Tag = Tag;
exports.Album = Album;
exports.Photo = Photo;
