'use strict';
var FlagService = require('../models/flag').Service,
    ApiUtils = require('../utils/apiutils');

exports.flagQuestion = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId,
            reason = req.body.reason;
        FlagService.create(questionId, undefined, authUser._id, reason, ApiUtils.handleResult(req, res));
    });
};

exports.flagComment = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var commentId = req.body.commentId,
            reason = req.body.reason;
        FlagService.create(undefined, commentId, authUser._id, reason, ApiUtils.handleResult(req, res));
    });
};

exports.list = function (req, res) {
    ApiUtils.authAdmin(req, res, function (authUser) {
        FlagService.list( ApiUtils.handleResult(req, res));
    });
};

