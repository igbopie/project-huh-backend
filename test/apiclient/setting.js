var apiClientBase = require('./apiclientbase');

exports.update = function (params, callback) {
    apiClientBase.post('/api/setting/update', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}

exports.list = function (params, callback) {
    apiClientBase.post('/api/setting/list', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}