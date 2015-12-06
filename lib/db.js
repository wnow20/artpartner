var mysql = require('mysql');
var Connection = require('mysql/')
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    port            : 30156,
    user            : 'root',
    password        : 'root',
    database        : 'artpartner',
    //queryFormat     : function (query, values) {
    //    console.log('queryFormat, values');
    //    console.log(query, values);
    //    if (!values) return query;
    //    return query.replace(/\:(\w+)/g, function (txt, key) {
    //        if (values.hasOwnProperty(key)) {
    //            return this.escape(values[key]);
    //        }
    //        return txt;
    //    }.bind(this))
    //}
});

module.exports = pool;