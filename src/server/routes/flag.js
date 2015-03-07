var FlagService = require('../models/flag').Service;
var ApiUtils = require('../utils/apiutils');

exports.flag = function (req, res) {
    var questionId = req.body.questionId;
    var userId = req.body.userId;
    var reason = req.body.reason;
    FlagService.create(questionId, userId, reason, ApiUtils.handleResult(req, res));
};

