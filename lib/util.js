exports.isDate = function(date) {
    var type = toString.call(date);
    return '[object Date]' === type;
}