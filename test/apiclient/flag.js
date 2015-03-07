var apiClientBase = require('./apiclientbase');

exports.flag = function (params, callback) {
  apiClientBase.post('/api/question/flag', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}
