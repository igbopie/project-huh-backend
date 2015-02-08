var QuestionVoteService = require('../models/questionVote').Service;
var CommentVoteService = require('../models/commentVote').Service;
var ApiUtils = require('../utils/apiutils');

exports.up = function (req, res) {
    var questionId = req.body.questionId;
    var commentId = req.body.commentId;
    var userId = req.body.userId;
    if (questionId) {
      QuestionVoteService.upVote(questionId, userId, function (err) {
        if (err) {
          ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else {
          ApiUtils.api(req, res, ApiUtils.OK, null, null);
        }
      });
    } else if (commentId) {
      CommentVoteService.upVote(commentId, userId, function (err) {
        if (err) {
          ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else {
          ApiUtils.api(req, res, ApiUtils.OK, null, null);
        }
      });
    } else {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, "Please, specify commentId or questionId", null);
    }
};


exports.down = function (req, res) {
  var questionId = req.body.questionId;
  var commentId = req.body.commentId;
  var userId = req.body.userId;
  if (questionId) {
    QuestionVoteService.downVote(questionId, userId, function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  } else if (commentId) {
    CommentVoteService.downVote(commentId, userId, function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  } else {
    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, "Please, specify commentId or questionId", null);
  }
};



exports.clear = function (req, res) {
  var questionId = req.body.questionId;
  var commentId = req.body.commentId;
  var userId = req.body.userId;
  if (questionId) {
    QuestionVoteService.clearVote(questionId, userId, function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  } else if (commentId) {
    CommentVoteService.clearVote(commentId, userId, function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  } else {
    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, "Please, specify commentId or questionId", null);
  }
};
