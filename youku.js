const cheerio = require("cheerio")
    , fetch = require('node-fetch')
    , FormData = require('form-data')
    , iconv = require('iconv-lite');

class YouKu {
    constructor() {

    }

    getlist(link) {
        return new Promise((resolve, reject) => {

            fetch(link).then(res => res.text()).then(body => {
                var $ = cheerio.load(body);

                //获取分类
                var obj = {};
                $("#filterPanel .item").each(function () {
                    var t = $(this);
                    var key = t.find('label').text().replace('：', '')
                    var arr = [];
                    t.find('ul li').each(function () {
                        var a = $(this).find('a');
                        var text = a.text(),
                            href = a.attr('href');
                        if (key == '分类') href = '//list.youku.com' + href

                        if (a.text() == "") {
                            text = $(this).text();
                            href = "";
                        } else {
                            href = 'http:' + href;
                        }
                        arr.push({
                            title: text,
                            link: href
                        })
                    })
                    obj[key] = arr;
                });

                //获取列表
                var list = []
                $(".panel .mr1").each(function () {
                    var t = $(this),
                        quic = t.find('.quic');
                    list.push({
                        title: quic.attr('alt'),
                        img: quic.attr('src'),
                        actor: t.find('.actor').text(),
                        link: 'http:' + t.find('.title a').attr('href')
                    })
                })

                //获取翻页
                var pager = []
                $('.yk-pages li').each(function () {
                    var t = $(this),
                        title = t.find('a').text() || t.text(),
                        link = t.find('a').attr('href') || '',
                        current = t.hasClass('current') ? 1 : 0;
                    if (link != '') link = 'http:' + link;
                    pager.push({
                        title: title,
                        link: link,
                        current: current
                    })
                })

                resolve({
                    filter: obj,
                    list: list,
                    pager: pager
                });
            }).catch(ex => {
                reject(ex)
            })

        })
    }
}



module.exports = new YouKu()