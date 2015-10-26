module.exports = Page;

function Page() {
    this.totalCount = 0;
    this.numPerPage = 20;
    this.pageNumShown = 10;
    this.currentPage = 1;

}

Page.gen = function(req, res) {
    var page = new Page();
    page.numPerPage = req.param('numPerPage') || page.numPerPage;
    page.pageNumShown = req.param('pageNumShown') || page.pageNumShown;
    page.currentPage = req.param('currentPage') || page.currentPage;

    return page;
}

Page.prototype.toLimitStr = function() {
    var start = this.currentPage * this.numPerPage - this.numPerPage;
    return start + ',' + this.numPerPage;
}

Page.prototype.getOffset = function() {
    return this.numPerPage * this.currentPage;
}
Page.prototype.setTotalCount = function(total) {
    this.totalCount = total;
}