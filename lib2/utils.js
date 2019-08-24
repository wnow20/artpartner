var Promise = require('bluebird');
var fs = require('fs');

var mobileRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
var tabletRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i

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
    },
    isMobile: function isMobile(ua) {
        if (typeof ua !== 'string') return false;

        return tabletRE.test(ua) || mobileRE.test(ua);
    },
};