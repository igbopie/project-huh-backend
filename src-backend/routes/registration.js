'use strict';
var RegistrationService = require('../models/registration').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    var email = req.body.email,
        platform = req.body.platform;
    RegistrationService.create(email, platform, ApiUtils.handleResult(req, res));
};

exports.list = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        RegistrationService.list( ApiUtils.handleResult(req, res));
    });
};

