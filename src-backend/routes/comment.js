'use strict';
var CommentService = require('../models/comment').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var text = req.body.text,
            questionId = req.body.questionId;
        CommentService.create(text, authUser._id, questionId, ApiUtils.handleResult(req, res));
    });
};

exports.list = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId,
            pagination = ApiUtils.getPaginationParams(req);

        CommentService.listByQuestion(
            questionId,
            authUser._id,
            pagination.page,
            pagination.numItems,
            ApiUtils.handleResult(req, res)
        );
    });
};
