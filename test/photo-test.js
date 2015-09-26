var Photo = require('../lib/photo');
var assert = require('assert');

var photo = new Photo({
    title: '这是一个标题',
    create_time: new Date(),
    update_time: new Date()
});

photo.truncate(function(err, result) {
    console.log('truncate', err, result);

    photo.count(function(err, count) {
        assert.equal(err, null, 'there should be any err');
        assert.equal(count, 0, 'count should be 0');

        photo.save(function(err, id) {
            console.log('id');
            console.log(id);
            photo.get(id, function() {
                console.log(photo);
                assert.notEqual(photo.id, undefined, 'photo.id should not be null/undefined');

                assert.equal(err, null);
                assert.equal(count, 0, 'count should be 0');

                photo.title = 'Updated Title3';

                photo.update(function(err, result) {
                    if (err) {
                        console.error('更新失败', err, result);
                    } else {
                        console.log('更新成功', result);
                    }
                });
            });
        });
    });
});



