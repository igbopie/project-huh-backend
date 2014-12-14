var apiClientBase = require('./apiclientbase');


exports.inRange = function (latitude, longitude, token, callback) {
  var params = {
    latitude: latitude,
    longitude: longitude,
    token: token
  };

  apiClientBase.post('/api/mark/inrange', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}

exports.listMyMarks = function (latitude, longitude, token, callback) {
  var params = {
    latitude: latitude,
    longitude: longitude,
    token: token
  };

  apiClientBase.post('/api/mark/mymarks', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}

exports.update = function (markId, name, description, locationName, locationAddress, mapIconId, token, callback) {
  var params = {
    markId: markId,
    name: name,
    description: description,
    locationName: locationName,
    locationAddress: locationAddress,
    mapIconId: mapIconId,
    token: token
  };

  apiClientBase.post('/api/mark/update', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}


exports.search = function (latitude, longitude, radius, text, userLatitude, userLongitude, token, callback) {
  var params = {
    latitude: latitude,
    longitude: longitude,
    radius: radius,
    text: text,
    userLatitude: userLatitude,
    userLongitude: userLongitude,
    token: token
  };

  apiClientBase.post('/api/mark/search', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
};

exports.view = function (markId, latitude, longitude, token, callback) {
  var params = {
    markId: markId,
    longitude: longitude,
    latitude: latitude,
    token: token
  };
  apiClientBase.post('/api/mark/view', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
};

exports.delete = function (markId, token, callback) {
  var params = {
    markId: markId,
    token: token
  };
  apiClientBase.post('/api/mark/delete', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
};

exports.favourite = function (markId, token, callback) {
  var params = {
    markId: markId,
    token: token
  };
  apiClientBase.post('/api/mark/favourite', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null);
    }
  });
};

exports.unfavourite = function (markId, token, callback) {
  var params = {
    markId: markId,
    token: token
  };
  apiClientBase.post('/api/mark/unfavourite', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null);
    }
  });
}

exports.listFavourite = function (token, callback) {
  var params = {
    token: token
  };
  apiClientBase.post('/api/mark/favourite/list', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}


exports.listUserPublic = function (username, token, callback) {
  var params = {
    token: token,
    username: username
  };
  apiClientBase.post('/api/mark/user/public/list', params, function (code, headers, data) {
    if (code != 200) {
      callback("The server responded with an invalid code: " + code + " : " + data, code);
    } else {
      callback(null, JSON.parse(data).response);
    }
  });
}