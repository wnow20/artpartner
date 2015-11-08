var Model = require('../lib2/model');
var Sequelize = Model.Sequelize;

Model.Album.findOne({
    where: {
        id: 5
    },
    include: {
        model: Model.Tag
    }
}).then(function (album) {
    console.log(album.name);
    console.log(album.tag.name);
});