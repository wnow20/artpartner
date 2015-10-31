var Sequelize = require('sequelize');
var sequelize = new Sequelize('artpartner', 'root', 'Opslter1', {
    host: 'www.asdfz.cn',
    port: 3306,
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    define: {
        updatedAt: 'update_time',
        createdAt: 'create_time'
    }
});

module.exports = {
    sequelize: sequelize
};