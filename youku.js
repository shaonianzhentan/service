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

            var utid = 'pDgjEpFynFICAXTu2VrskFiN'
            var time = Date.parse(new Date())
            let yurl = `https://ups.youku.com/ups/get.json?vid=${videoid}&ccode=0401&client_ip=192.168.1.1&utid=${utid}&client_ts=${time}`
            //console.log(yurl);
            fetch(yurl, {
                method: "GET",
                headers: {
                    "referer": "http://v.youku2.com",
                    "Content-Type": "application/x-www-form-urlencoded",
                    cookie: 'juid=01bos95csh267m; __aryft=1504878581; yseid=1507440105631TiA5fS; yseidcount=13; seid=01brth8fe323rh; _m_h5_tk=b0c8e2b6e3bf1dc8e06bf235f5fc8f94_1507454920642; _m_h5_tk_enc=6c2a133acd0913286b7ca33f6e8723d2; referhost=http%3A%2F%2Fwww.youku.com; __utmarea=; __ysuid=1507453318893qTng1j; PHPSESSID=oifa1b0188vqcc1tlq6bivjhl3; __ayvstp=9; __aysvstp=14; __arycid=cms-00-1519-27244-0; __arcms=cms-00-1519-27244-0; ypvid=1507453641608TMZDxg; ysestep=17; yseidtimeout=1507460841609; ycid=0; ystep=134; seidtimeout=1507455441614; P_pck_rm=n6YExAvggMZY0Bldul9NEjzeHbHTNGmuE1heuKV866QhRUxtmIDrJML5vBpQube6YJmE2i9rdBX%2BUQ12YUGFNoQWm9GdMxoiFxWt4cYTiij4MV4e3sU7PgaSzzLhvS4ikgqM1QeRE0iIOKSzbVu4FETu1JQinPFOdq35btAKpUE%3D; P_j_scl=hasCheckLogin; P_gck=NA%7CW9uSlzM8gJKaPL8tVRU3Sw%3D%3D%7CNA%7C1507453670298; visit=145997b600c6cf6595e8e93b2a365751; rpvid=1507453675781eC1Wky-1507453679542; cna=pDgjEpFynFICAXTu2VrskFiN; __ayft=1507440105783; __aysid=1507388564920w7Y; __arpvid=1507453679919XhIJHa-1507453679931; __ayscnt=1; __aypstp=25; __ayspstp=121; P_sck=KBavo2IFNy1cyI6WCOc5ZXd6nPgQ3bHzvbb486yNkfNfwXMdWY1L7PBi%2FTVTWhXg6UDSCAtEiKLQQhaaOD2k38o9r8H66%2BhuNc%2FGkFjlKI4y9N9BgNmEV4wSiIHGN9geGpu4h%2BJKq7%2FEccB%2B2uV0Xy96k3rVPDIsOEMivLtw35A%3D; isg=Ap6eJaDzSxDOY58FbabnW-gj7zQg92LczZNeg0gnC-Hcaz5FsO-y6cQJEUEc'
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
                var m3u8_url = body.data.stream[0].m3u8_url;
                if (body.data.stream.length > 2) {
                    //超高清
                    //body.data.stream[3].segs.forEach(ele => { stream.push(ele.cdn_url)  })
                    //高清
                    m3u8_url = body.data.stream[3].m3u8_url
                }

                resolve({
                    video: {
                        title: video.title,
                        link: video.weburl,
                        m3u8_url: m3u8_url
                    },
                    list: videos,
                    user: body.data.user
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