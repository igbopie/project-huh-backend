'use strict';
var AuthUserService = require('../models/authUser').Service,
    ApiUtils = require('../utils/apiutils');

exports.login = function (req, res) {
    var username = req.body.username,
        password = req.body.password;

    if (username && password) {
        AuthUserService.auth(username, password, ApiUtils.handleResult(req, res));
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_BAD_REQUEST, 'Please, specify username and password', null);
    }
};


exports.check = function (req, res) {
    if (req.authUser) {
        ApiUtils.api(req, res, ApiUtils.OK, 'UserLogged', null);
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, 'Unauthorized', null);
    }
};


