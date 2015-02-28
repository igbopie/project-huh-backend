var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils')
  ;


var QuestionVoteSchema = new Schema({
  questionId: {type: Schema.Types.ObjectId, required: true, ref: "Question"},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now},
  score: {type: Number, required: true, default: 0}
});

QuestionVoteSchema.index({ userId: 1, questionId: 1 }, { unique: true });
QuestionVoteSchema.index({ userId: 1, score: 1 });

var QuestionVote = mongoose.model('QuestionVote', QuestionVoteSchema);

//Service?
var QuestionVoteService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: QuestionVoteService
};

var QuestionService = require('../models/question').Service;
var NotificationService = require('../models/notification').Service;

QuestionVoteService.findVote = function (questionId, userId, callback) {
  QuestionVote.findOne({questionId: questionId, userId: userId}, callback);
}

QuestionVoteService.upVote = function (questionId, userId, callback) {
  QuestionVoteService.vote(1, questionId, userId, callback);
  NotificationService.onQuestionUpVoted(questionId);
};

QuestionVoteService.downVote = function (questionId, userId, callback) {
  QuestionVoteService.vote(-1, questionId, userId, callback);
  NotificationService.onQuestionDownVoted(questionId);
};


QuestionVoteService.clearVote = function (questionId, userId, callback) {
  QuestionVoteService.vote(0, questionId, userId, callback);
  NotificationService.onQuestionDownVoted(questionId);
};

QuestionVoteService.vote = function (score, questionId, userId, callback) {
  QuestionVoteService.findVote(questionId, userId, function(err, vote){
    if(err) return callback(err);

    var oldScore;
    var newVote = false;

    if (!vote) {
      newVote = true;
      vote = new QuestionVote();
      vote.questionId = questionId;
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

        QuestionService.updateVoteScore(diffScore, score, newVote, questionId, callback);
      });
    } else if (score === 0){
      vote.remove(function(err){
        if (err) return callback(err);

        QuestionService.updateVoteScore(diffScore, score, newVote, questionId, callback);
      })
    }
  });
};

QuestionVoteService.findUpVoteQuestionIds = function (userId, page, numItems, callback) {
  QuestionVote.find(
    {userId:userId, score:1},
    "questionId",
    {
      limit: numItems,
      skip: numItems * page
    },
    function(err, votes){
      if(err) return callback(err);

      var questionIds = votes.map(function(vote){return vote.questionId});
      callback(null, questionIds);
    }
  );
};



