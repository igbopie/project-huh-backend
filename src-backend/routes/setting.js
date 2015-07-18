'use strict';
var SettingsService = require('../models/setting').Service,
    ApiUtils = require('../utils/apiutils');

exports.update = function (req, res) {
    var name = req.body.name,
        userId = req.body.userId,
        value = req.body.value;
    SettingsService.update(name, value, userId, ApiUtils.handleResult(req, res));
};

exports.list = function (req, res) {
    var userId = req.body.userId;
    SettingsService.findAll(userId, ApiUtils.handleResult(req, res));
};
