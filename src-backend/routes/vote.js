'use strict';
var QuestionVoteService = require('../models/questionVote').Service,
    CommentVoteService = require('../models/commentVote').Service,
    ApiUtils = require('../utils/apiutils');

exports.up = function (req, res) {
    var questionId = req.body.questionId,
        commentId = req.body.commentId,
        userId = req.body.userId;

    if (questionId) {
        QuestionVoteService.upVote(questionId, userId, ApiUtils.handleResult(req, res));
    } else if (commentId) {
        CommentVoteService.upVote(commentId, userId, ApiUtils.handleResult(req, res));
    } else {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, "Please, specify commentId or questionId", null);
    }
};

exports.down = function (req, res) {
    var questionId = req.body.questionId,
        commentId = req.body.commentId,
        userId = req.body.userId;

    if (questionId) {
        QuestionVoteService.downVote(questionId, userId, ApiUtils.handleResult(req, res));
    } else if (commentId) {
        CommentVoteService.downVote(commentId, userId, ApiUtils.handleResult(req, res));
    } else {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, "Please, specify commentId or questionId", null);
    }
};

exports.clear = function (req, res) {
    var questionId = req.body.questionId,
        commentId = req.body.commentId,
        userId = req.body.userId;

    if (questionId) {
        QuestionVoteService.clearVote(questionId, userId, ApiUtils.handleResult(req, res));
    } else if (commentId) {
        CommentVoteService.clearVote(commentId, userId, ApiUtils.handleResult(req, res));
    } else {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, "Please, specify commentId or questionId", null);
    }
};
