'use strict';
var FlagService = require('../models/flag').Service,
    ApiUtils = require('../utils/apiutils');

exports.flag = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId,
            reason = req.body.reason;
        FlagService.create(questionId, authUser._id, reason, ApiUtils.handleResult(req, res));
    });
};

exports.list = function (req, res) {
    ApiUtils.authAdmin(req, res, function (authUser) {
        FlagService.list( ApiUtils.handleResult(req, res));
    });
};

