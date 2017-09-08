var express = require('express')
    , cors = require('cors');
var app = express();

app.use(cors());

app.get('/', function (req, res) {
    res.send('hello world');
});


var VipVideo = require('./VipVideo');
app.get('/vipvideo', function (req, res) {
    var link = req.query.url;
    var type = req.query.type;
    if (link) {

        if (type == 'youku') {
            VipVideo.youku(link).then(data => {
                res.send(data)
            }).catch(err => {
                res.send('')
            })
        } else {
            VipVideo.geturl(link).then(data => {
                res.send(data)
            }).catch(err => {
                res.send('')
            })
        }
    } else {
        res.status(505).send('url参数错误');
    }
});

app.get('/vipvideo/url', function (req, res) {
    var link = req.query.url;
    if (link) {
        VipVideo.geturl(link).then(data => {
            res.send(data)
        }).catch(err => {
            res.send('')
        })
    } else {
        res.status(505).send('url参数错误');
    }
});

var VipVideoSearch = require('./VipVideoSearch')
app.get('/vipvideo/search/qq', function (req, res) {
    var key = req.query.key;            
    VipVideoSearch.qq(req.query.key).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/search/youku', function (req, res) {
    var key = req.query.key;            
    VipVideoSearch.youku(req.query.key).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/search/le', function (req, res) {
    var key = req.query.key;            
    VipVideoSearch.le(req.query.key).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/search/mg', function (req, res) {
    var key = req.query.key;            
    VipVideoSearch.mg(req.query.key).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});

var VipVideoList = require('./VipVideoList')
app.get('/vipvideo/list/qq', function (req, res) {    
    VipVideoList.qq(req.query.url).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/list/youku', function (req, res) {
    
    VipVideoList.youku(req.query.url).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/list/le', function (req, res) {    
    VipVideoList.le(req.query.url).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/list/mg', function (req, res) {           
    VipVideoList.mg(req.query.url).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/list/sohu', function (req, res) {           
    VipVideoList.mg(req.query.url).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});
app.get('/vipvideo/list/iqiyi', function (req, res) {
    VipVideoList.mg(req.query.url).then(data => {
        res.json(data)
    }).catch(err => {
        res.json([])
    })
});


var Weather = require('./weather')
app.get('/weather', function (req, res) {
    Weather.get(req.query.py).then(data => {
        res.json(data)
    }).catch(err => {
        res.status(505).send(err);
    })
});


app.get('/sh', function (req, res) {
    var user = req.query.user,
        pwd = req.query.pwd;
    require('./sh').login(user, pwd).then(t => t.sign()).then(data => {
        res.json(data)
    }).catch(err => {
        console.error('错误信息：', err)
        res.status(505).send(err)
    })
});


app.listen(4000);
console.log('@4000')