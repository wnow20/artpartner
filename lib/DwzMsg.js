function DwzMsg(status, message) {
    this.statusCode = status;
    this.message = message

    this.navTabId = DwzMsg.navTabId;
}

DwzMsg.prototype.setNavTabId = function(navTabId) {
    this.navTabId = navTabId;
}
DwzMsg.prototype.setForwardUrl = function(forwardUrl) {
    this.forwardUrl = forwardUrl;
}
DwzMsg.prototype.setCallbackType = function(callbackType) {
    this.callbackType = callbackType;
}

DwzMsg.success = function(message) {
    return new DwzMsg(DwzMsg.OK, message);
}
DwzMsg.error = function(message) {
    return new DwzMsg(DwzMsg.ERROR, message);
}

DwzMsg.OK = '200';
DwzMsg.ERROR = '300';
DwzMsg.TIMEOUT = '301';

DwzMsg.navTabId = 'default';

module.exports = DwzMsg;