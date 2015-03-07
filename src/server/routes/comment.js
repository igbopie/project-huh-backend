var CommentService = require('../models/comment').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
  var text = req.body.text;
  var userId = req.body.userId;
  var questionId = req.body.questionId;
  CommentService.create(text, userId, questionId, ApiUtils.handleResult(req, res));
};

exports.list = function (req, res) {
  var questionId = req.body.questionId;
  var userId = req.body.userId;
  CommentService.listByQuestion(questionId, userId, ApiUtils.handleResult(req, res));
};
