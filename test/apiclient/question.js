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

exports.recent = function (params, callback) {
  apiClientBase.post('/api/question/recent', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
};

exports.popular = function (params, callback) {
  apiClientBase.post('/api/question/popular', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
};


exports.trending = function (params, callback) {
  apiClientBase.post('/api/question/trending', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
};