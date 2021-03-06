var apiClientBase = require('./apiclientbase');


exports.dashboard = function (params, callback) {
    apiClientBase.post('/api/starbucks/dashboard', params, function (code, headers, data) {
        if (code != 201 && code != 200) {
            callback("The server responded with an invalid code: " + code + " : " + data, code);
        } else {
            callback(null, JSON.parse(data).response);
        }
    });
};
