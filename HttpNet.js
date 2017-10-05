const cheerio = require("cheerio")
    , request = require('request')
    , iconv = require('iconv-lite');


class HttpNet {
    constructor() {
        this.UserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
    }

    request(options) {

        return new Promise((resolve, reject) => {
            request(JSON.parse(options), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body)
                }
                else
                    reject(error)
            });
        })

    }

    request_gb2312(url) {

        return new Promise((resolve, reject) => {
            request({ url: url, encoding: null }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var buf = iconv.decode(body, 'gb2312');
                    resolve(buf)
                }
                else
                    reject(error)
            });
        })

    }

}

module.exports = new HttpNet()
