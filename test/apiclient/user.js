var apiClientBase = require('./apiclientbase');


exports.create = function (callback) {
    apiClientBase.post('/api/user/create', {}, function (code, headers, data) {
        if (code != 201 && code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}


exports.login = function (params, callback) {
    apiClientBase.post('/api/user/login', params, function (code, headers, data) {
        if (code != 201 && code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}



exports.loginCheck = function (params, callback) {
    apiClientBase.post('/api/user/login/check', params, function (code, headers, data) {
        if (code != 201 && code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}