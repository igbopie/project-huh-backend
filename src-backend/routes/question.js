'use strict';
var QuestionService = require('../models/question').Service,
    QuestionVoteService = require('../models/questionVote').Service,
    CommentService = require('../models/comment').Service,
    ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var text = req.body.text,
            latitude = req.body.latitude,
            longitude = req.body.longitude,
            type = req.body.type;
        QuestionService.create(type, text, latitude, longitude, authUser._id, ApiUtils.handleResult(req, res));
    });
};

exports.view = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var questionId = req.body.questionId;
        QuestionService.view(questionId, authUser._id, ApiUtils.handleResult(req, res, true));
    });
};

exports.recent = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);

        QuestionService.recent(authUser._id, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
    });
};

exports.trending = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);

        QuestionService.trending(authUser._id, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
    });
};

exports.popular = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);

        QuestionService.popular(authUser._id, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
    });
};

exports.mine = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);

        QuestionService.mine(authUser._id, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
    });
};

exports.near = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var latitude = req.body.latitude,
            longitude = req.body.longitude,
            pagination = ApiUtils.getPaginationParams(req);
        if (latitude && longitude) {
            QuestionService.near(
                authUser._id,
                latitude,
                longitude,
                pagination.page,
                pagination.numItems,
                ApiUtils.handleResult(req, res)
            );
        } else {
            ApiUtils.handleResult(req, res)('Invalid params');
        }
    });
};

exports.favorites = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);

        QuestionVoteService.findUpVoteQuestionIds(
            authUser._id,
            pagination.page,
            pagination.numItems,
            ApiUtils.chainResult(req, res, function (questionIds) {
                QuestionService.processQuestionIds(questionIds, authUser._id, ApiUtils.handleResult(req, res));
            })
        );
    });
};

exports.commented = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);

        CommentService.findCommentedQuestionIds(
            authUser._id,
            pagination.page,
            pagination.numItems,
            ApiUtils.chainResult(req, res, function (questionIds) {
                QuestionService.processQuestionIds(questionIds, authUser._id, ApiUtils.handleResult(req, res));
            })
        );
    });
};
