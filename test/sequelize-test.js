var Sequelize = require('sequelize');

var sequelize = new Sequelize('artpartner', 'root', 'root', {
    host: 'localhost',
    port: 30156,
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

var Employee = sequelize.define('Employee', {
    name:  {
        type     : Sequelize.STRING,
        allowNull: false,
        get      : function()  {
            var title = this.getDataValue('title');
            // 'this' allows you to access attributes of the instance
            return this.getDataValue('name') + ' (' + title + ')';
        }
    },
    title: {
        type     : Sequelize.STRING,
        allowNull: false,
        set      : function(val) {
            this.setDataValue('title', val.toUpperCase());
        }
    }
});

Employee
    .create({ name: 'wnow22', title: 'senior NodeJS engineer' })
    .then(function(employee) {
        console.log(employee.get('name')); // John Doe (SENIOR ENGINEER)
        console.log(employee.get('title')); // SENIOR ENGINEER

    });

Employee.findById(2).then(function(employee) {
    console.log(employee.get('name')); // John Doe (SENIOR ENGINEER)
    console.log(employee.get('title')); // SENIOR ENGINEER
});

