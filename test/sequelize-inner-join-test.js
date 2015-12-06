var Sequelize = require('sequelize');

var sequelize = new Sequelize('artpartner', 'root', 'root', {
    host: 'www.asdfz.cn',
    port: 3306,
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    define: {
        timestamps: false,
        updatedAt: 'update_time',
        createdAt: 'create_time'
    }
});

var A = sequelize.define('A', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    num: { type: Sequelize.STRING }
}, {
    tableName: 'a'
});


var B = sequelize.define('B', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true },
    num: { type: Sequelize.STRING }
}, {
    tableName: 'b'
});


A.hasMany(B, {
    foreignKey: 'id'
});

B.belongsTo(A, {
    foreignKey: 'id'
});

A.findAll({
    include: {
        model: B,
        required: true // 加个required: true,即可
    }
}).then(function (results) {
    console.log(results);
});