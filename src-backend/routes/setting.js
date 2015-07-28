'use strict';
var SettingsService = require('../models/setting').Service,
    ApiUtils = require('../utils/apiutils');

exports.update = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var name = req.body.name,
            value = req.body.value;
        SettingsService.update(name, value, authUser._id, ApiUtils.handleResult(req, res));
    });
};

exports.list = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        SettingsService.findAll(authUser._id, ApiUtils.handleResult(req, res));
    });
};
