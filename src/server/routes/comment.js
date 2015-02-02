var CommentService = require('../models/comment').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
  var text = req.body.text;
  var userId = req.body.userId;
  var questionId = req.body.questionId;
  CommentService.create(text, userId, questionId, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};

exports.list = function (req, res) {
  var questionId = req.body.questionId;
  var userId = req.body.userId;
  CommentService.listByQuestion(questionId, userId,  function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};
