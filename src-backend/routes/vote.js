'use strict';
var QuestionVoteService = require('../models/questionVote').Service,
    CommentVoteService = require('../models/commentVote').Service,
    ApiUtils = require('../utils/apiutils');

exports.up = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId,
            commentId = req.body.commentId;

        if (questionId) {
            QuestionVoteService.upVote(questionId, authUser._id, ApiUtils.handleResult(req, res));
        } else if (commentId) {
            CommentVoteService.upVote(commentId, authUser._id, ApiUtils.handleResult(req, res));
        } else {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, 'Please, specify commentId or questionId', null);
        }
    });
};

exports.down = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId,
            commentId = req.body.commentId;

        if (questionId) {
            QuestionVoteService.downVote(questionId, authUser._id, ApiUtils.handleResult(req, res));
        } else if (commentId) {
            CommentVoteService.downVote(commentId, authUser._id, ApiUtils.handleResult(req, res));
        } else {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, 'Please, specify commentId or questionId', null);
        }
    });
};

exports.clear = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId,
            commentId = req.body.commentId;

        if (questionId) {
            QuestionVoteService.clearVote(questionId, authUser._id, ApiUtils.handleResult(req, res));
        } else if (commentId) {
            CommentVoteService.clearVote(commentId, authUser._id, ApiUtils.handleResult(req, res));
        } else {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, 'Please, specify commentId or questionId', null);
        }
    });
};
