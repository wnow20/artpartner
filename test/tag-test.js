var Tag = require('../lib/Tag');
var assert = require('assert');


console.log('开始测试 Tag dao');

var tag = new Tag({
    name: '明星',
    create_time: new Date(),
    update_time: new Date()
});

tag.truncate(function(err, result) {
    console.log('truncate', err, result);

    tag.count(function(err, count) {
        assert.equal(err, null, 'there should be any err');
        assert.equal(count, 0, 'count should be 0');


        tag.save(function(err, result) {

            assert.equal(err, null);
            assert.equal(result.affectedRows, 1, 'affectedRows should be 1');

            console.log('保存成功，ID：' + result.insertId);

            console.log('测试完毕');
        });
    })
});
