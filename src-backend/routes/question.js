'use strict';
var QuestionService = require('../models/question').Service,
    QuestionVoteService = require('../models/questionVote').Service,
    CommentService = require('../models/comment').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    var text = req.body.text,
        userId = req.body.userId,
        latitude = req.body.latitude,
        longitude = req.body.longitude,
        type = req.body.type;
    QuestionService.create(type, text, latitude, longitude, userId, ApiUtils.handleResult(req, res));
};

exports.view = function (req, res) {
    var questionId = req.body.questionId,
        userId = req.body.userId;
    QuestionService.view(questionId, userId, ApiUtils.handleResult(req, res));
};

exports.recent = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    QuestionService.recent(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.trending = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    QuestionService.trending(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.popular = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    QuestionService.popular(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.mine = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    if (userId) {
        QuestionService.mine(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
    } else {
        ApiUtils.handleResult(req, res)('Invalid params');
    }
};

exports.near = function (req, res) {
    var userId = req.body.userId,
        latitude = req.body.latitude,
        longitude = req.body.longitude,
        pagination = ApiUtils.getPaginationParams(req);
    if (latitude && longitude) {
        QuestionService.near(
            userId,
            latitude,
            longitude,
            pagination.page,
            pagination.numItems,
            ApiUtils.handleResult(req, res)
        );
    } else {
        ApiUtils.handleResult(req, res)('Invalid params');
    }
};

exports.favorites = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    if (userId) {
        QuestionVoteService.findUpVoteQuestionIds(
            userId,
            pagination.page,
            pagination.numItems,
            ApiUtils.chainResult(req, res, function (questionIds) {
                QuestionService.processQuestionIds(questionIds, userId, ApiUtils.handleResult(req, res));
            })
        );
    } else {
        ApiUtils.handleResult(req, res)('Invalid params');
    }
};

exports.commented = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);

    if (userId) {
        CommentService.findCommentedQuestionIds(
            userId,
            pagination.page,
            pagination.numItems,
            ApiUtils.chainResult(req, res, function (questionIds) {
                QuestionService.processQuestionIds(questionIds, userId, ApiUtils.handleResult(req, res));
            })
        );
    } else {
        ApiUtils.handleResult(req, res)('Invalid params');
    }
};
