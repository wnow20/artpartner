var Model = require('../lib2/model');
var bcrypt = require('bcrypt');

var salt = bcrypt.genSaltSync();
console.log(salt);
var hash1 = bcrypt.hashSync('admin', salt);
var hash2 = bcrypt.hashSync('123123', '$2a$10$fYhH/GNRRASWRi/n5uhW9u');

console.log(hash1);
console.log(hash2);

Model.User.findOne({
    where: {
        username: 'admin'
    }
}).then(function(user) {
    console.log(user.salt);
    console.log(user.password);

    bcrypt.hash('admin', user.salt, function(err, hash) {
        console.log(hash);
    });
});