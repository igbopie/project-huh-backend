var apiClientBase = require('./apiclientbase');

exports.list = function (params, callback) {
  apiClientBase.post('/api/notification/list', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}

exports.markAllAsRead = function (params, callback) {
  apiClientBase.post('/api/notification/markallasread', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}
