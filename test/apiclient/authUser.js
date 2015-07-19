var apiClientBase = require('./apiclientbase');


exports.login = function (params, callback) {
    apiClientBase.post('/api/auth/login', params, function (code, headers, data) {
        if (code != 201 && code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
};


exports.check = function (params, callback) {
    apiClientBase.post('/api/auth/check', params, function (code, headers, data) {
        if (code != 201 && code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
};

