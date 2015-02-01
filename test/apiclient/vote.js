var apiClientBase = require('./apiclientbase');

exports.up = function (params, callback) {
  apiClientBase.post('/api/vote/up', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}

exports.down = function (params, callback) {
  apiClientBase.post('/api/vote/down', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}