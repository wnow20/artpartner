(function(w, $) {
    var doc = w.document;
    var defaultOptions = {
        At: null
    };

    function WeiboShare(ele, options) {
        this._ele = isString(ele)? getEle(ele) : ele;
        this.url = 'http://service.weibo.com/share/share.php';
        this.popup = true;
        this.options = $.extend({}, defaultOptions, options);

        this.profile = {
            url: null,
            type: 3,
            pic: null,
            title: null,
            appkey: null
        };

        this.initEvent();
    }

    WeiboShare.prototype.genParams = function () {
        var title =
            doc.getElementsByTagName('title')[0] && doc.getElementsByTagName('title')[0].text + (this.options.At? '\n' + this.options.At : '');

        this.profile.title = encodeURIComponent(title);
        this.profile.url = encodeURIComponent(location.href);
        this.profile.pic = getPic();
    };

    function getPic() {
        var imgs = document.getElementsByTagName('img');
        var img, size, result = '';
        for (var i = 0; i < imgs.length; i++) {
            img = imgs[i];
            size = getImgSize(img.src);

            if (size.width >= 300 && size.height >= 300) {
                result += '||' + img.src;
            }
        }
        return result.substr(2);
    }

    function getImgSize(filePath){
        var img=new Image();
        img.src = filePath;

        return {
            width: img.width,
            height: img.height
        }
    }

    WeiboShare.prototype.initEvent = function () {
        var _ = this;
        this._ele.addEventListener('click', function (e) {
            _.open();
            e.preventDefault();
        });
    }
    WeiboShare.prototype.getUrl = function () {
        var qs = [
            'url=' + this.profile.url,
            'type=' + this.profile.type,
            'title=' + this.profile.title,
            'appkey=' + this.profile.appkey,
            'pic=' + this.profile.pic,
        ].join('&');

        return this.url + '?' + qs;
    };

    WeiboShare.prototype.open = function () {
        this.genParams();

        if (this.popup) {
            window.open(this.getUrl(),'popup','height=500,width=500')
        } else {
            window.open(this.getUrl());

        }
    };

    function getEle(id) {
        return doc.getElementById(id);
    }

    function isString(arg) {
        return Object.prototype.toString.call(arg) === '[object String]';
    }

    w.WeiboShare = w.WeiboShare || WeiboShare;

    $.fn.extend({
        weiboShare: function(options) {
            this.each(function (index, ele) {
                new WeiboShare(this, options);
            });
        }
    })
}(window, jQuery || Zepto, undefined));