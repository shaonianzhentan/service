const cheerio = require("cheerio")
    , fetch = require('node-fetch')
    , FormData = require('form-data')
    , iconv = require('iconv-lite');

class YouKu {
    constructor() {

    }

    getvidoe(link) {
        return new Promise((resolve, reject) => {

            var mp = link.match(/id_(\S+)\.html/);

            if (!mp) {
                reject('youku链接不正确')
                return;
            }

            var videoid = mp[1]

            var utid = 'LqINEj7DmmICATzT3tJb8EFy'
            var time = Date.parse(new Date())
            let yurl = `https://ups.youku.com/ups/get.json?vid=${videoid}&ccode=0401&client_ip=192.168.1.1&utid=${utid}&client_ts=${time}`
            //console.log(yurl);
            fetch(yurl, {
                method: "GET",
                headers: {
                    "referer": "http://v.youku2.com",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(res => res.json()).then(body => {
                var video = body.data.video;
                //resolve(body);

                //获取集数
                var videos = [];
                body.data.videos.list.forEach(ele => {
                    videos.push({
                        id: ele.vid,
                        title: ele.title,
                        seq: ele.seq,
                        link: 'http://v.youku.com/v_show/id_' + ele.encodevid + '.html'
                    })
                })
                //获取视频流
                var stream = [];
                //超高清
                //body.data.stream[3].segs.forEach(ele => { stream.push(ele.cdn_url)  })
                //高清
                body.data.stream[4].segs.forEach(ele => { stream.push(ele.cdn_url) })

                resolve({
                    video: {
                        title: video.title,
                        link: video.weburl,
                        stream: stream
                    },
                    list: videos
                });
            }).catch(ex => {
                reject(ex)
            })

        })

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
                        quic = t.find('.quic'),
                        link = t.find('.title a').attr('href');
                    if (link.indexOf('http://') < 0) link = 'http:' + link;
                    list.push({
                        title: quic.attr('alt'),
                        img: quic.attr('src'),
                        actor: t.find('.actor').text(),
                        link: link
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