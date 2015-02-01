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

QuestionVoteSchema.index({ userId: 1, questionId: 1 }, { unique: true })

var QuestionVote = mongoose.model('QuestionVote', QuestionVoteSchema);

//Service?
var QuestionVoteService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: QuestionVoteService
};

var QuestionService = require('../models/question').Service;

QuestionVoteService.findVote = function (questionId, userId, callback) {
  QuestionVote.findOne({questionId: questionId, userId: userId}, callback);
}

QuestionVoteService.upVote = function (questionId, userId, callback) {
  QuestionVoteService.vote(1, questionId, userId, callback);
};

QuestionVoteService.downVote = function (questionId, userId, callback) {
  QuestionVoteService.vote(-1, questionId, userId, callback);
};

QuestionVoteService.vote = function (score, questionId, userId, callback) {
  QuestionVoteService.findVote(questionId, userId, function(err, vote){
    if(err) return callback(err);

    var oldScore;

    if (!vote) {
      vote = new QuestionVote();
      vote.questionId = questionId;
      vote.userId = userId;
      oldScore = 0;
    } else {
      oldScore = vote.score;
      vote.updated = Date.now();
    }

    vote.score = score;

    vote.save(function(err) {
      if(err) return callback(err);

      var diffScore = vote.score - oldScore;

      QuestionService.updateVoteScore(diffScore, questionId, callback);
    });
  });
};




