const cheerio = require("cheerio")
    , fetch = require('node-fetch')
    , FormData = require('form-data')
    , iconv = require('iconv-lite');

//获取集数
class VipVideoList {
    constructor() {
        this.MobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
    }

    youku(link) {

        return new Promise((resolve, reject) => {
            if (link.indexOf('v.youku.com/') < 0) reject('链接不正确');

            var mp = link.match(/id_(\S+)\.html/);

            if (!mp) reject('youku链接不正确')

            var videoid = mp[1]
            var utid = 'LqINEj7DmmICATzT3tJb8EFy'
            var time = Date.parse(new Date())
            let yurl = `https://ups.youku.com/ups/get.json?vid=${videoid}&ccode=0401&client_ip=192.168.1.1&utid=${utid}&client_ts=${time}`

            fetch(yurl, {
                method: "GET",
                headers: {
                    "referer": "http://v.youku2.com",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(res => res.json()).then(body => {

                var videos = [];
                body.data.videos.list.forEach(ele => {
                    videos.push({
                        id: ele.vid,
                        title: ele.title,
                        seq: ele.seq,
                        link: 'http://v.youku.com/v_show/id_' + ele.encodevid + '.html'
                    })
                })
                resolve(videos);

            }).catch(ex => {

                reject(ex)
            })
        })
    }

    le(link) {

        return new Promise((resolve, reject) => {
            if (link.indexOf('www.le.com/ptv/vplay/') < 0) reject('链接不正确');

            fetch("http://d.api.m.le.com/card/dynamic?id=10014722&cid=2&vid=" + link.match(/\d+/g)[0] + "&platform=pc&type=episode,otherlist,relalbum,relvideo&isvip=0")
                .then(res => res.json())
                .then(obj => {
                    var arr = [];
                    obj.data.episode.videolist.forEach(function (ele) {
                        arr.push({
                            title: ele.title + '-' + ele.subTitle,
                            link: ele.url
                        });
                    });

                    resolve(arr);

                }).catch(err => {
                    reject(err);
                })

        })

    }

    qq(link) {

        return new Promise((resolve, reject) => {
            if (link.indexOf('v.qq.com/x/') < 0) reject('链接不正确');

            fetch(link).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];
                $(".mod_episode .item").each(function () {
                    var t = $(this), link = 'https://v.qq.com' + t.find('a').attr('href');
                    arr.push({
                        title: t.find('a').text().replace(/\n/g, '').trim(),
                        link: link
                    });
                });
                resolve(arr);
            }).catch(err => {
                reject(err);
            })
        })

    }

    mg(link) {

        return new Promise((resolve, reject) => {
            try {
                var video_id = link.match(/\d+.html/)[0].replace('.html', '');
                fetch("http://pcweb.api.mgtv.com/episode/list?video_id=" + video_id + "&_=" + (new Date()).getTime() + "&page=0&size=40")
                    .then(res => res.json())
                    .then(obj => {
                        let arr = [];
                        obj.data.list.forEach(function (ele) {
                            var link = 'http://www.mgtv.com' + ele.url;
                            arr.push({
                                title: ele.t2 + '-' + ele.t1,
                                link: link
                            });
                        });

                        resolve(arr);
                    }).catch(err => {
                        reject(err);
                    })
            } catch (err) {
                reject(err);
            }
        })

    }

    sohu(link) {
        return new Promise((resolve, reject) => {

            if (link.indexOf('m.tv.sohu.com') < 0) {
                link = link.replace('tv.sohu.com', 'm.tv.sohu.com')
            }
            console.log(link);

            fetch(link, {
                method: "GET",
                headers: {
                    'User-Agent':this.MobileUserAgent
                }
            }).then(res => res.text()).then(body => {
                let $ = cheerio.load(body)
                    , arr = [];

                $(".pl-list .pl-list-item").each(function () {
                    var t = $(this),
                        link = t.data('url').replace('m.tv.sohu.com', 'tv.sohu.com');
                    arr.push({
                        title: t.data('title'),
                        link: link
                    });
                });

                resolve(arr);

            }).catch(err => {
                reject(err);
            })
        })

    }

    iqiyi(link) {
        return new Promise((resolve, reject) => {

            fetch(link).then(res => res.text()).then(body => {
                let $ = cheerio.load(body);

                var video_id = 0,
                    a = $("[data-qiyu-albumid]"),
                    b = $("[data-trailer-sidoraid]");
                if (a.length > 0) video_id = a.data("qiyu-albumid");
                else if (b.length > 0) video_id = b.data("trailer-sidoraid");

                if (video_id == 0) reject('未找到数据')
                //获取API集数
                fetch("http://cache.video.qiyi.com/jp/avlist/" + video_id + "/1/100/?albumId=" + video_id + "&pageNo=1&pageNum=100")
                    .then(res => res.text())
                    .then(body => {
                        try {
                            let arr = [];

                            var tvInfoJs = JSON.parse(body.replace('var tvInfoJs=', ''));
                            tvInfoJs.data.vlist.forEach(function (ele) {
                                var link = ele.vurl;
                                arr.push({
                                    id: ele.id,
                                    title: ele.shortTitle + '-' + ele.vt,
                                    link: link
                                });
                            });

                            resolve(arr);
                        } catch (err) {
                            reject(err);
                        }
                    }).catch(err => {
                        reject(err);
                    })

            }).catch(err => {
                reject(err);
            })
        })
    }
}

module.exports = new VipVideoList()
