'use strict';
var FlagService = require('../models/flag').Service,
    ApiUtils = require('../utils/apiutils');

exports.flag = function (req, res) {
    var questionId = req.body.questionId,
        userId = req.body.userId,
        reason = req.body.reason;
    FlagService.create(questionId, userId, reason, ApiUtils.handleResult(req, res));
};

