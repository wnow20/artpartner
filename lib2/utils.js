var Promise = require('bluebird');
var fs = require('fs');

module.exports = {
    randomString: function randomString(length, chars) {
        chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    },
    FileUtil: {
        mkdirIfNotExists: function (path) {
            var promise = new Promise(function (resolve, reject) {
                fs.exists(path, function (exists) {
                    resolve(exists);
                });
            });

            return promise.then(function(exsits) {
                if (exsits) {
                    return ;
                }
                return new Promise(function (resolve, reject) {
                    fs.mkdir(path, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });
        },
        existsSync: function(path) {
            return new Promise(function (resolve, reject) {
                fs.exists(path, function (exists) {
                    resolve(exists);
                });
            });
        },
        mkdirSync: function() {
            return new Promise(function (resole, reject) {
                fs.mkdir(path, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resole();
                    }
                });
            });
        }
    },
    isArray: function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
};