var apiClientBase = require('./apiclientbase');

exports.create = function (params, callback) {
    apiClientBase.post('/api/comment/create', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}

exports.list = function (params, callback) {
    apiClientBase.post('/api/comment/list', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}

exports.view = function (params, callback) {
    apiClientBase.post('/api/comment/view', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}

exports.delete = function (params, callback) {
    apiClientBase.post('/api/comment/delete', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}

exports.flag = function (params, callback) {
    apiClientBase.post('/api/comment/flag', params, function (code, headers, data) {
        if (code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
}