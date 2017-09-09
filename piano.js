var request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio');

class Pinao {
    constructor() {

        var file = "music.db";
        var exists = fs.existsSync(file);
        var sqlite3 = require('sqlite3').verbose();
        this.db = new sqlite3.Database(file);
        if (!exists) {
            this.db.run("CREATE TABLE tbPiano (scale TEXT,note TEXT,tonic TEXT,rollCall TEXT,notation TEXT,mp3 TEXT)");
        }

    }

    get(args) {
        return new Promise((resolve, reject) => {

            var db = this.db;
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

                        //下载资源到本机
                        this.download(sourceScale, scale);
                        this.download(sourceNote, note);
                        this.download(sourceMp3, mp3);


                        //保存到数据库
                        db.serialize(function () {

                            db.get("SELECT rowid AS id FROM tbPiano where scale=? and note=? and tonic=? and rollCall=? and notation=? and mp3=?",
                                [scale, note, tonic, rollCall, notation, mp3],
                                function (err, row) {
                                    console.log(err, row);
                                    if (row == null) {
                                        db.run("INSERT INTO tbPiano VALUES (?,?,?,?,?,?)", [scale, note, tonic, rollCall, notation, mp3]);
                                    }
                                });

                            db.get("SELECT count(scale) as totle FROM tbPiano", function (err, row) {
                                console.log(row);
                            });

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

                            /*
                            db.each("SELECT rowid AS id, * FROM tbPiano", function(err, row) {
                                console.log(row);
                            });
                            */

                        });

                    } else {
                        reject(error)
                    }
                })
        })
    }

    download(file, dirfile) {
        var df = 'resource/' + dirfile;
        fs.exists(df, (exists) => {
            if (!exists) request('http://5.supfree.net/' + file).pipe(fs.createWriteStream(df));
        });
    }
}

module.exports = new Pinao()

/*
var piano = new Pinao()

piano.get('zy,czy,sy,bf').then(data => {
    console.log(data);
}).catch(err => console.log(err))
*/