'use strict';
var CommentService = require('../models/comment').Service,
    QuestionService = require('../models/question').Service,
    QuestionVoteService = require('../models/questionVote').Service,
    CommentVoteService = require('../models/commentVote').Service,
    UserService = require('../models/user').Service,
    ApiUtils = require('../utils/apiutils');

exports.dashboard = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {

        // TODO: use promises
        CommentService.getTotal(function (err, totalComments) {
            QuestionService.getTotal(function (err, totalQuestions) {
                QuestionVoteService.getTotal(function (err, totalVoteQuestions) {
                    CommentVoteService.getTotal(function (err, totalVoteComments) {
                        UserService.getTotal(function (err, totalUsers) {
                            var results = {
                                users: totalUsers,
                                questions: totalQuestions,
                                comments: totalComments,
                                questionVotes: totalVoteQuestions,
                                commentVotes: totalVoteComments
                            };
                            ApiUtils.handleResult(req, res)(undefined, results);
                        });
                    });
                });
            });
        });
    });
};
