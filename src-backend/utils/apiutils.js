'use strict';
var Utils = require('./utils');

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
ApiUtils.OK_CUSTOM = 250; // someday can be usefull

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

/*jslint unparam: true*/
ApiUtils.api = function (req, res, code, message, responseObject) {
    if (code === ApiUtils.SERVER_INTERNAL_ERROR) {
        console.error(message);
        res.setHeader('Error', message);
    }
    res.json(code, new ApiResponse(code, message, responseObject));
};
/*jslint unparam: false*/

ApiUtils.handleResult = function (req, res, handle404) {
    return function (err, results) {
        if (err && err instanceof Utils.HuhError) {
            ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_BAD_REQUEST, err, null);
        } else if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else if (!results && handle404) {
            ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, results);
        } else {
            ApiUtils.api(req, res, ApiUtils.OK, null, results);
        }
    };
};

ApiUtils.chainResult = function (req, res, callback) {
    return function (err, results) {
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else {
            callback(results);
        }
    };
};

ApiUtils.getPaginationParams = function (req) {
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
    var authUser = req.authUser;

    if (authUser) {
        callback(authUser);
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
};

ApiUtils.authAdmin = function (req, res, callback) {
    ApiUtils.auth(req, res, function (authUser) {
        if (authUser.admin) {
            callback(authUser);
        } else {
            ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
        }
    });
};

// export the class
module.exports = ApiUtils;
