var cwd = process.cwd();
var Sequelize = require('sequelize');
var Config = require(cwd + '/lib2/config.json');

var sequelize = new Sequelize(Config.db_datebase, Config.db_name, Config.db_password, {
    host: Config.db_host,
    port: Config.db_port,
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