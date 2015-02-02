var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils')
  ;


var commentSchema = new Schema({
  text: {type: String, required: false},
  questionId: {type: Schema.Types.ObjectId, required: true, ref: "Question"},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now},
  voteScore: {type: Number, required: true, default: 0}
});

commentSchema.index({userId: 1});
commentSchema.index({questionId: 1, created: -1});

var Comment = mongoose.model('Comment', commentSchema);

//Service?
var CommentService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: CommentService
};


var CommentVoteService = require('../models/commentVote').Service;

var process = function (dbComment, userId, callback) {
  var comment = {};
  comment._id = dbComment._id;
  comment.text = dbComment.text;
  comment.created = dbComment.created;
  comment.updated = dbComment.updated;
  if (userId) {
    console.log("HEy");
    CommentVoteService.findVote(dbComment._id, userId, function(err, vote) {
      console.log("HEy2");
      if(err){
        console.error("Could not fetch my score");
      }
      if(vote){
        comment.myVote = vote.score;
      }
      callback(undefined, comment);
    });
  } else {
    callback(undefined, comment);
  }
};


CommentService.create = function (text, userId, questionId, callback) {
  var comment = new Comment();
  comment.text = text;
  comment.questionId = questionId;
  comment.userId = userId;

  //TODO Validation
  comment.save(function(err) {
    callback(err, comment);
  });
};

CommentService.listByQuestion = function (questionId, userId, callback) {
  Comment.find({questionId:questionId})
    .sort({ field: 'desc', created: -1 })
    .exec(function (err, comments) {
      if(err) return callback(err);

      Utils.map(
        comments,
        function(dbComment, mapCallback) {
          process(dbComment, userId, mapCallback);
        },
        callback
      );
  });
};

CommentService.updateVoteScore = function (voteIncrement, commentId, callback) {
  var conditions = { _id: commentId }
    , update = { $inc: { voteScore: voteIncrement }}
    , options = { multi: false };

  Comment.update(conditions, update, options,
    function (err) {
      callback(err);
    });
};



