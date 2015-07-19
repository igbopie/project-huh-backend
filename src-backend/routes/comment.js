'use strict';
var CommentService = require('../models/comment').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    var text = req.body.text,
        userId = req.body.userId,
        questionId = req.body.questionId;
    CommentService.create(text, userId, questionId, ApiUtils.handleResult(req, res));
};

exports.list = function (req, res) {
    var questionId = req.body.questionId,
        userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    CommentService.listByQuestion(
        questionId,
        userId,
        pagination.page,
        pagination.numItems,
        ApiUtils.handleResult(req, res)
    );
};
