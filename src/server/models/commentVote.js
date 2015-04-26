var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils')
  ;


var CommentVoteSchema = new Schema({
  commentId: {type: Schema.Types.ObjectId, required: true, ref: "Comment"},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now},
  score: {type: Number, required: true, default: 0}
});

CommentVoteSchema.index({ userId: 1, commentId: 1 }, { unique: true })

var CommentVote = mongoose.model('CommentVote', CommentVoteSchema);

//Service?
var CommentVoteService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: CommentVoteService
};

var CommentService = require('../models/comment').Service;
var NotificationService = require('../models/notification').Service;

CommentVoteService.findVote = function (commentId, userId, callback) {
  CommentVote.findOne({commentId: commentId, userId: userId}, callback);
}

CommentVoteService.upVote = function (commentId, userId, callback) {
  CommentVoteService.vote(1, commentId, userId, callback);
  NotificationService.onCommentUpVoted(commentId);
};

CommentVoteService.downVote = function (commentId, userId, callback) {
  CommentVoteService.vote(-1, commentId, userId, callback);
  NotificationService.onCommentDownVoted(commentId);
};

CommentVoteService.clearVote = function (commentId, userId, callback) {
  CommentVoteService.vote(0, commentId, userId, callback);
  NotificationService.onCommentDownVoted(commentId);
};

CommentVoteService.vote = function (score, commentId, userId, callback) {
  CommentVoteService.findVote(commentId, userId, function(err, vote){
    if(err) return callback(err);

    var oldScore;
    var newVote = false;

    if (!vote) {
      newVote = true;
      vote = new CommentVote();
      vote.commentId = commentId;
      vote.userId = userId;
      oldScore = 0;
    } else {
      oldScore = vote.score;
      vote.updated = Date.now();
    }

    vote.score = score;
    var diffScore = vote.score - oldScore;

    if (diffScore === 0){
      callback();
    } else if (score !== 0) {
      vote.save(function (err) {
        if (err) return callback(err);

        CommentService.updateVoteScore(diffScore, score, newVote, commentId, userId, callback);
      });
    } else if (score === 0){
      vote.remove(function(err){
        if (err) return callback(err);

        CommentService.updateVoteScore(diffScore, score, newVote, commentId, userId, callback);
      })
    }
  });
};




