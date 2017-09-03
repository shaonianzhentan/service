//食行生鲜每日签到
class SHSX {
    constructor() {
        this.HostUrl = "https://wechat.34580.com";
        this.LoginUrl = this.HostUrl + '/login/login_action_v2';
        this.SignUrl = this.HostUrl + '/signin/index/signin';
        var request = require('request');

        var j = request.jar();

        j.setCookie(request.cookie('domainx_v2=https%3A%2F%2Fapi1.34580.com%2Fsh%2F'), this.HostUrl);
        j.setCookie(request.cookie('city=%E4%B8%8A%E6%B5%B7%E5%B8%82'), this.HostUrl);
        j.setCookie(request.cookie('cityid=3'), this.HostUrl);
        j.setCookie(request.cookie('ret_url=%2F%2Fwechat.34580.com%2Fmy%2Findex'), this.HostUrl);

        this.request = request.defaults({
            jar: j,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'DNT': '1',
                'Host': 'wechat.34580.com',
                'Referer': 'http://wechat.34580.com/login/index',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
            }
            , gzip: true
        });
    }

    fetch(ops) {
        return new Promise((resolve, reject) => {
            this.request(ops, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve({
                        res: response,
                        body: body
                    })
                }
            })
        })
    }
    //登录
    login(user, pwd) {
        return new Promise((resolve, reject) => {
            this.fetch({
                method: 'POST',
                url: this.LoginUrl,
                form: {
                    name: user,
                    pwd: pwd
                }
            }).then((data) => {
                try {
                    var obj = JSON.parse(data.body)
                    if (obj.error == 0) {
                        resolve(this)
                    } else if (obj.error == 1) {
                        obj.msg = decodeURIComponent(obj.msg)
                        reject(obj)
                    } else {
                        reject(obj)
                    }

                } catch (ex) {
                    reject(ex)
                }
            }).catch(err => {
                reject(err)
            })

        })
    }
    //签到
    sign() {
        return new Promise((resolve, reject) => {
            this.fetch({
                method: 'GET',
                url: this.SignUrl
            }).then((data) => {
                try {
                    var obj = JSON.parse(data.body)
                    if (obj.error == 1) {
                        obj.msg = decodeURIComponent(obj.msg)
                    }
                    resolve(obj)
                } catch (ex) {
                    reject(data)
                }
            }).catch(err => {
                reject(err)
            })

        })
    }
}

module.exports = new SHSX()