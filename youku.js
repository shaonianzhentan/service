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
                    cookie: 'juid=01bos95csh267m; __aryft=1504878581; yseid=1507440105631TiA5fS; yseidcount=13; _m_h5_tk=b0c8e2b6e3bf1dc8e06bf235f5fc8f94_1507454920642; _m_h5_tk_enc=6c2a133acd0913286b7ca33f6e8723d2; __utmarea=; __ysuid=1507453318893qTng1j; __ayvstp=9; __aysvstp=14; visit=145997b600c6cf6595e8e93b2a365751; __arycid=cms-00-1519-27244-0; __arcms=cms-00-1519-27244-0; ypvid=1507454742931m0qhry; ysestep=19; yseidtimeout=1507461942933; ycid=0; ystep=136; ykss=f9fad959c5bf23df1adc0afd; seid=01brtnooki26ra; referhost=http%3A%2F%2Ffaxian.youku.com; P_pck_rm=n6YExAvggMZY0Bldul9NEnjbJsM1MBbusLCmHPpkhFyb1fBIe3IO4qVpOtOTKhIPak9PU4HlqOwxJZ0H7RXgHJ7YrT%2FVcC%2FTg4D2oPraokZO50jnbatl32F5mhHERWHMK7ErxgZ2CtipxPNMQWZbtR8L9O7gjHKcgLgi8m3D9zE%3D; P_j_scl=hasCheckLogin; P_gck=NA%7CW9uSlzM8gJKaPL8tVRU3Sw%3D%3D%7CNA%7C1507457838515; seidtimeout=1507459639904; P_ck_ctl=CAC6BD37FA2F3F254C65C6E26F3FABA0; cna=pDgjEpFynFICAXTu2VrskFiN; __ayft=1507440105783; __aysid=1507388564920w7Y; __arpvid=1507457843415kOSecy-1507457843420; __ayscnt=1; __aypstp=35; __ayspstp=131; P_sck=KBavo2IFNy1cyI6WCOc5ZXJkmtSZbyAK1GPqEh0CTv%2BJX3oAPysrPYAfH7ndmQkPToay4N1sdsOgcEPy0YALUFrbBDxRqSbTCJkYGcO02ToakXAc6j493nMAQg0SvFwPhdF04JKm4B%2FjbNTg1BWiMm53EALuXUXYVTDa%2BQNFHb8%3D; isg=Ahwcq4n3qfYJGl1bszwFfX7J7ToOPcC6e4mcvfYdKIfqQbzLHqWQT5Lz059C; rpvid=1507457843338anBrcY-1507457853737'
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