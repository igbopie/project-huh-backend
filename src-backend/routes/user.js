'use strict';
var UserService = require('../models/user').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    UserService.create(ApiUtils.handleResult(req, res));
};

exports.addApnToken = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var apntoken = req.body.apntoken;
        UserService.addApnToken(apntoken, authUser._id, ApiUtils.handleResult(req, res));
    });
};

exports.removeApnToken = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        UserService.removeApnToken(authUser._id, ApiUtils.handleResult(req, res));
    });
};

exports.addGcmToken = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var gcmtoken = req.body.gcmtoken;
        UserService.addGcmToken(gcmtoken, authUser._id, ApiUtils.handleResult(req, res));
    });
};

exports.removeGcmToken = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        UserService.removeGcmToken(authUser._id, ApiUtils.handleResult(req, res));
    });
};

exports.updateLocation = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var latitude = req.body.latitude,
            longitude = req.body.longitude;
        UserService.updateLocation(authUser._id, latitude, longitude, ApiUtils.handleResult(req, res));
    });
};

exports.login = function (req, res) {
    var username = req.body.username,
        email = req.body.email,
        password = req.body.password;
    if (username && password) {
        UserService.auth(username, password, ApiUtils.handleResult(req, res));
    } else if (email && password) {
        UserService.authEmail(email, password, ApiUtils.handleResult(req, res));
    } else {
        ApiUtils.api(req,
            res,
            ApiUtils.CLIENT_ERROR_BAD_REQUEST,
            'Please, specify username or email and password',
            null);
    }
};

exports.loginCheck = function (req, res) {
    if (req.authUser) {
        ApiUtils.api(req, res, ApiUtils.OK, 'UserLogged', null);
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, 'Unauthorized', null);
    }
};

