const fetch = require('node-fetch')
    , cheerio = require("cheerio");
    
//天气接口
class Weather {
    constructor() {

    }

    get() {
        return new Promise((resolve, reject) => {
            fetch('http://i.tianqi.com/index.php?c=code&id=12&icon=1&num=3&site=27')
                .then(res => res.text())
                .then(body => {
                    try {
                        var $ = cheerio.load(body);

                        var arr = [];
                        $('.wt').each(function () {
                            var t = $(this);
                            arr.push({
                                text: t.parent().attr('title'), //天气文字
                                pic: t.find('.pngtqico').attr('src'), //天气图片
                                date: t.find('.wt1 .wtline').eq(0).text(), //（今天，明天，后天）日期
                                temperature: t.find('.wt1 .wtline').eq(1).text() //摄氏度
                            })
                        })
                        var obj = {
                            city: $('.wtname').text(),
                            data: arr
                        }

                        resolve(obj);
                    } catch (ex) {
                        reject(err);
                    }
                }).catch(err => {
                    reject(err);
                });
        })
    }
}


module.exports = new Weather()
