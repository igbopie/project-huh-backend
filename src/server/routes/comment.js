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
  var pagination = ApiUtils.getPaginationParams(req);

  CommentService.listByQuestion(questionId, userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};
