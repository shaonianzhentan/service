var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio');

class Pinao {
    constructor() {

    }

    get(args) {
        return new Promise((resolve, reject) => {

            var arr = args.split(",");
            var forms = {};
            arr.forEach(function (ele) {
                forms[ele] = "checked";
            });
            forms["vanswer"] = "";

            request.post({ url: 'http://5.supfree.net/5.asp?vhigh=checked', form: forms },
                (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        //console.log(body) // Show the HTML for the Google homepage.
                        let $ = cheerio.load(body);

                        var imgArr = $("#table2 img"),
                            nameArr = $("#div1 font"),
                            mp3 = $("embed").attr('src'),
                            scale = imgArr.eq(0).attr('src'),
                            note = imgArr.eq(1).attr('src'),
                            tonic = nameArr.eq(0).text(),
                            rollCall = nameArr.eq(1).text(),
                            notation = nameArr.eq(2).text();

                        mp3 = (mp3.match(/[0-9a-zA-Z]+\.mp3/))[0];
                        scale = scale.substr(scale.lastIndexOf('/') + 1);
                        note = note.substr(note.lastIndexOf('/') + 1);

                        var sourceScale = 'images/' + scale,
                            sourceNote = 'images/' + note,
                            sourceMp3 = 'mp3/' + mp3;

                            //输出数据
                            var host = "http://5.supfree.net/";
                            resolve({
                                scale: host + sourceScale,  //音阶
                                note: host + sourceNote,  //音符
                                tonic: tonic,     //主音
                                rollCall: rollCall,	//唱名
                                notation: notation,	//简谱
                                mp3: host + sourceMp3	  //mp3
                            });

                    } else {
                        reject(error)
                    }
                })
        })
    }
}

module.exports = new Pinao()

/*
var piano = new Pinao()

piano.get('zy,czy,sy,bf').then(data => {
    console.log(data);
}).catch(err => console.log(err))
*/