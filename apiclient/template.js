var apiClientBase = require('./apiclientbase');


exports.create = function (name, price, mediaId, token, callback) {
  var params = {name: name, price: price, mediaId: mediaId, token: token};
  apiClientBase.post('/api/template/create', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}


exports.list = function (ts, token, callback) {
  apiClientBase.post('/api/template', {timestamp: ts, token: token}, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code:" + code + " : " + data);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}