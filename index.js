var express = require('express');
var app = express();


app.get('/', function (req, res) {
    res.send('hello world');
});


var VipVideo = require('./VipVideo');
app.get('/vipvideo', function (req, res) {
    var link = req.query.url;
    if (link) {
        VipVideo.geturl(link).then(data => {
            res.send(data)
        }).catch(err => {
            res.send('')
        })
    }
    res.status(505).send('url参数错误');
});

var Weather = require('./weather')
app.get('/weather', function (req, res) {
    Weather.get().then(data => {
        res.json(data)
    }).catch(err => {
        res.status(505).send(err);
    })
});


app.listen(4000);
console.log('@4000')