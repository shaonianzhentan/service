const cheerio = require("cheerio")
    , fetch = require('node-fetch')
    , FormData = require('form-data')
    , iconv = require('iconv-lite');

class VipVideoSearch {
    constructor() {
        this.host = 'http://api.baiyug.cn/vip_p_0bc4/';
        this.PlayPageUrl = this.host + "index.php?url=";
        this.VideoPageUrl = this.host + "url.php"
    }

    youku(key) {
        return new Promise((resolve, reject) => {
            key = decodeURIComponent(key);
            fetch('http://www.soku.com/search_video/q_' + encodeURIComponent(key)).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];
                $('.DIR .s_dir').each(function () {
                    var tmp = $(this);
                    var a = tmp.find("a[href^='http://cps.youku.com/redirect.html']");
                    if (a.length == 0) a = tmp.find("a[href^='http://v.youku.com/v_show/id_']");


                    var title = a.attr('_log_title');
                    if (title != null && title != "") {
                        var video_url = decodeURIComponent(a.attr('href')).match(/http:\/\/v.youku.com\/v_show\/\S+\.html/);
                        try {
                            arr.push({
                                img: tmp.find('img').attr('src'),
                                title: title,
                                link: video_url[0],
                                source: '优酷'
                            });
                        } catch (ex) {
                            console.log(ex);
                        }
                    }
                });
                resolve(arr);
            }).catch(err => {
                reject(err);
            })
        })
    }

    le(key) {

        return new Promise((resolve, reject) => {
            key = decodeURIComponent(key);
            fetch('http://so.le.com/s?from=pc&index=0&ref=click&wd=' + encodeURIComponent(key)).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];

                $('.Tv-so,.Movie-so').each(function () {
                    var tmp = $(this);
                    var info = tmp.find(".info-tit");
                    var title = info.text().replace(/[\n\t\r\s+]/g, '');

                    try {
                        arr.push({
                            img: tmp.find('.left img').attr('src'),
                            title: title,
                            link: info.find('a').attr('href'),
                            source: '乐视'
                        });
                    } catch (ex) {
                        console.log(ex);
                    }

                });

                resolve(arr);
            }).catch(err => {
                reject(err);
            })
        })

    }

    qq(key) {

        return new Promise((resolve, reject) => {
            key = decodeURIComponent(key);
            fetch('https://v.qq.com/x/search/?q=' + encodeURIComponent(key)).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];
                $('.result_item').each(function () {
                    var tmp = $(this),
                        info = tmp.find(".result_figure"),
                        title = tmp.find('.result_title').text().replace(/[\n\t\r\s+]/g, ''),
                        link = info.attr('href');

                    try {
                        if (link.indexOf('//v.qq.com/x/') > 0) {
                            arr.push({
                                img: 'http:' + info.find('img').attr('src'),
                                title: title,
                                link: link,
                                source: '腾讯视频'
                            });
                        }
                    } catch (ex) {
                        console.log(ex);
                    }

                });

                resolve(arr);
            }).catch(err => {
                reject(err);
            })
        })

    }

    mg(key) {

        return new Promise((resolve, reject) => {
            key = decodeURIComponent(key);
            fetch('http://so.mgtv.com/so?k=' + encodeURIComponent(key)).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];

                $('.search-television').each(function () {
                    var tmp = $(this),
                        info = tmp.find(".report-click"),
                        title = info.find('img').attr('alt'),
                        link = tmp.find('.so-result-alis a').attr('href') || info.attr('href');

                    try {
                        arr.push({
                            img: info.find('img').attr('src'),
                            title: title.replace(/<\/?.+?>/g, ""),
                            link: link,
                            source: '芒果TV'
                        });
                    } catch (ex) {
                        console.error(ex);
                    }
                });

                $("[class*='so-result-info-imgo']").each(function () {
                    var tmp = $(this),
                        img = tmp.find('.report-click img').attr('src');
                    try {
                        tmp.find(".report-click").each(function () {

                            var title = $(this).attr('title');
                            if (title != null) {
                                arr.push({
                                    img: img,
                                    title: title.replace(/<\/?.+?>/g, ""),
                                    link: $(this).attr('href'),
                                    source: '芒果TV'
                                });
                            }
                        });

                    } catch (ex) {
                        console.error(ex);
                    }

                });

                resolve(arr);
            }).catch(err => {
                reject(err);
            })
        })


    }




    vipsp(key) {

        return new Promise((resolve, reject) => {
            key = decodeURIComponent(key);
            fetch('http://www.vipsp.cc/so.html?wd=' + encodeURIComponent(key)).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];

                $('.list .item').each(function () {
                    var t = $(this),
                        img = t.find(".cover img").attr('src'),
                        title = t.find('.detail .title').text().trim() + t.find('.detail .star').text().trim(),
                        link = t.find('.js-tongjic').attr('href');

                    try {
                        arr.push({
                            img: img,
                            title: title.replace(/<\/?.+?>/g, ""),
                            link: link,
                            source: '网络爬虫'
                        });
                    } catch (ex) {
                        console.error(ex);
                    }
                });



                resolve(arr);
            }).catch(err => {
                reject(err);
            })
        })


    }
}

module.exports = new VipVideoSearch()
