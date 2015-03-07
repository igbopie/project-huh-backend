var UserService = require('../models/user').Service;

var ApiResponse = function (code, message, responseObject) {
  this.code = code;
  this.message = message;
  this.response = responseObject;
};


var ApiUtils = {};
// http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
ApiUtils.OK = 200;
ApiUtils.OK_CREATED = 201;
ApiUtils.OK_ACCEPTED = 202;
ApiUtils.OK_CUSTOM = 250; //someday can be usefull

// CUSTOM 460-480
ApiUtils.CLIENT_ERROR_BAD_REQUEST = 400;
ApiUtils.CLIENT_ERROR_UNAUTHORIZED = 401;
ApiUtils.CLIENT_LOGIN_TIMEOUT = 440;
ApiUtils.CLIENT_LOGIN_FAILED = 460;
ApiUtils.CLIENT_ENTITY_ALREADY_EXISTS = 465;
ApiUtils.CLIENT_USERNAME_ALREADY_EXISTS = 466;
ApiUtils.CLIENT_EMAIL_ALREADY_EXISTS = 467;
ApiUtils.CLIENT_ENTITY_NOT_FOUND = 470;


// CUSTOM 560-580
ApiUtils.SERVER_INTERNAL_ERROR = 500;
ApiUtils.SERVER_NOT_IMPLEMENTED = 501;

ApiUtils.api = function (req, res, code, message, responseObject) {
  if (code == ApiUtils.SERVER_INTERNAL_ERROR) {
    console.error(message);
    res.setHeader("Error", message);
  }
  res.json(code, new ApiResponse(code, message, responseObject));
};

ApiUtils.handleResult = function (req,res) {
  return function(err, results) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, results);
      }
    };
};

ApiUtils.chainResult = function (req,res, callback) {
  return function(err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      callback(results);
    }
  };
};

ApiUtils.getPaginationParams = function (req, res) {
  var pagination = {};
  pagination.page = req.body.page;
  pagination.numItems = req.body.numItems;

  if (!pagination.page) {
    pagination.page = 0;
  }

  if (!pagination.numItems) {
    pagination.numItems = 50;
  }
  if (pagination.numItems < 10) {
    pagination.numItems = 10;
  }
  return pagination;
};

ApiUtils.auth = function (req, res, callback) {
  var token = req.body.token;

  var auth = parseAuth(req.headers['authorization']);

  if (auth && auth.scheme == "MarkAuth") {
    token = auth.token;
  }

  //console.log(req);
  if (token) {
    UserService.findUserByToken(token, function (err, user) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else if (user == null) {
        ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
      } else {
        callback(user);
      }
    });
  } else {
    ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
  }
}

function parseAuth(auth) {
  if (!auth || typeof auth !== 'string') {
    return;
  }

  var result = {}, parts, decoded, colon;

  parts = auth.split(' ');

  result.scheme = parts[0];
  if (result.scheme !== 'Basic') {
    for (var i = 1; i < parts.length; i++) {
      var vars = parts[i].split('=');
      result[vars[0]] = vars[1].substring(1, vars[1].length - 1);//remove "
    }
    return result;
  }

  decoded = new Buffer(parts[1], 'base64').toString('utf8');
  colon = decoded.indexOf(':');

  result.username = decoded.substr(0, colon);
  result.password = decoded.substr(colon + 1);

  return result;
};


// export the class
module.exports = ApiUtils;