var QuestionService = require('../models/question').Service;
var QuestionVoteService = require('../models/questionVote').Service;
var CommentService = require('../models/comment').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    var text = req.body.text;
    var userId = req.body.userId;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var type = req.body.type;
    QuestionService.create(type, text, latitude, longitude, userId, ApiUtils.handleResult(req, res));
};

exports.view = function (req, res) {
  var questionId = req.body.questionId;
  var userId = req.body.userId;
  QuestionService.view(questionId, userId, ApiUtils.handleResult(req, res));
};


exports.recent = function (req, res) {
  var userId = req.body.userId;
  var pagination = ApiUtils.getPaginationParams(req);

  QuestionService.recent(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.trending = function (req, res) {
  var userId = req.body.userId;
  var pagination = ApiUtils.getPaginationParams(req);

  QuestionService.trending(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.popular = function (req, res) {
  var userId = req.body.userId;
  var pagination = ApiUtils.getPaginationParams(req);

  QuestionService.popular(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.mine = function (req, res) {
  var userId = req.body.userId;
  var pagination = ApiUtils.getPaginationParams(req);

  QuestionService.mine(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};


exports.favorites = function (req, res) {
  var userId = req.body.userId;
  var pagination = ApiUtils.getPaginationParams(req);

  QuestionVoteService.findUpVoteQuestionIds(userId, pagination.page, pagination.numItems,
    ApiUtils.chainResult(req, res, function(questionIds) {
      QuestionService.processQuestionIds(questionIds, userId, ApiUtils.handleResult(req, res));
    })
  );
};

exports.commented = function (req, res) {
  var userId = req.body.userId;
  var pagination = ApiUtils.getPaginationParams(req);

  CommentService.findCommentedQuestionIds(userId, pagination.page, pagination.numItems,
    ApiUtils.chainResult(req, res, function(questionIds) {
      QuestionService.processQuestionIds(questionIds, userId, ApiUtils.handleResult(req, res));
    })
  );
};