var apiClientBase = require('./apiclientbase');

exports.create = function (params, callback) {
  apiClientBase.post('/api/question/create', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}

exports.list = function ( callback) {
  apiClientBase.post('/api/question/list', {}, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}