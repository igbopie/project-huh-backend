var apiClientBase = require('./apiclientbase');


exports.create = function (callback) {
  apiClientBase.post('/api/user/create', {}, function (code, headers, data) {
    if (code != 201) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}
