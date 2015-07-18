'use strict';
var UserService = require('../models/user').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    UserService.create(ApiUtils.handleResult(req, res));
};

exports.addApnToken = function (req, res) {
    var userId = req.body.userId,
        apntoken = req.body.apntoken;
    UserService.addApnToken(apntoken, userId, ApiUtils.handleResult(req, res));
};

exports.removeApnToken = function (req, res) {
    var userId = req.body.userId;
    UserService.removeApnToken(userId, ApiUtils.handleResult(req, res));
};

exports.addGcmToken = function (req, res) {
    var userId = req.body.userId,
        gcmtoken = req.body.gcmtoken;
    UserService.addGcmToken(gcmtoken, userId, ApiUtils.handleResult(req, res));
};

exports.removeGcmToken = function (req, res) {
    var userId = req.body.userId;
    UserService.removeGcmToken(userId, ApiUtils.handleResult(req, res));
};

exports.updateLocation = function (req, res) {
    var userId = req.body.userId,
        latitude = req.body.latitude,
        longitude = req.body.longitude;
    UserService.updateLocation(userId, latitude, longitude, ApiUtils.handleResult(req, res));
};
