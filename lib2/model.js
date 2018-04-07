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

var Asdf = db.sequelize.define('asdf', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    notice: { type: Sequelize.STRING },
    contact: { type: Sequelize.STRING },
    aboutus: { type: Sequelize.STRING }
}, {
    tableName: 'asdf'
});

var Tag = db.sequelize.define('tag', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    name: { type: Sequelize.STRING },
    intro: { type: Sequelize.STRING },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false },
    is_topnav: { type: Sequelize.BOOLEAN, defaultValue: false }
}, {
    tableName: 'tag'
});

var Album = db.sequelize.define('album', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    tag_id: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING },
    intro: { type: Sequelize.TEXT },
    seq: { type: Sequelize.INTEGER },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false },
    uuid: { type: Sequelize.STRING },
    cover: { type: Sequelize.STRING },
}, {
    tableName: 'album'
});

var Photo = db.sequelize.define('photo', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    album_id: { type: Sequelize.INTEGER },
    uuid: { type: Sequelize.STRING },
    name: { type: Sequelize.STRING },
    intro: { type: Sequelize.STRING },
    path: { type: Sequelize.STRING },
    url: { type: Sequelize.STRING },
    large_url: { type: Sequelize.STRING },
    middle_url: { type: Sequelize.STRING },
    thumbnail_url: { type: Sequelize.STRING },
    is_cover: { type: Sequelize.BOOLEAN },
    del_flag: { type: Sequelize.BOOLEAN, defaultValue: false },
    seq: { type: Sequelize.INTEGER }
}, {
    tableName: 'photo'
});

var AlbumTag = db.sequelize.define('album_tag', {
    album_id: {
        type: Sequelize.INTEGER
    },
    tag_id: {
        type: Sequelize.INTEGER
    }
}, {
    timestamps: false,
    tableName: 'album_tag'
});

Tag.hasMany(Album, {
    foreignKey: 'tag_id'
});

Album.belongsTo(Tag, {
    foreignKey: 'tag_id'
});

Album.hasMany(Photo, {
    foreignKey: 'album_id'
});

Photo.belongsTo(Album, {
    foreignKey: 'album_id'
});

exports.User = User;
exports.Asdf = Asdf;

exports.Tag = Tag;
exports.Album = Album;
exports.Photo = Photo;
