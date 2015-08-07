'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Async = require('async');


var commentSchema = new Schema({
    text: {type: String, required: false},
    questionId: {type: Schema.Types.ObjectId, required: true, ref: 'Question'},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    username: {type: String, required: false},
    created: {type: Date, required: true, default: Date.now},
    updated: {type: Date, required: true, default: Date.now},
    voteScore: {type: Number, required: true, default: 0},
    nVotes: {type: Number, required: true, default: 0},
    nUpVotes: {type: Number, required: true, default: 0},
    nDownVotes: {type: Number, required: true, default: 0}
});

commentSchema.index({userId: 1, created: -1});
commentSchema.index({questionId: 1, created: -1});

var Comment = mongoose.model('Comment', commentSchema);

// Service?
var CommentService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Service: CommentService
};


var CommentVoteService = require('./commentVote').Service;
var QuestionService = require('./question').Service;
var NotificationService = require('./notification').Service;
var QuestionNameService = require('./questionName').Service;

var processObject = function (dbComment, userId, callback) {
    var processInternal = function () {
        var comment = {};
        comment._id = dbComment._id;
        comment.text = dbComment.text;
        comment.created = dbComment.created;
        comment.updated = dbComment.updated;
        comment.voteScore = dbComment.voteScore;
        comment.nVotes = dbComment.nVotes;
        comment.nUpVotes = dbComment.nUpVotes;
        comment.nDownVotes = dbComment.nDownVotes;
        comment.username = dbComment.username;

        if (userId) {
            CommentVoteService.findVote(dbComment._id, userId, function (err, vote) {
                if (err) {
                    console.error('Could not fetch my score');
                }
                if (vote) {
                    comment.myVote = vote.score;
                }
                callback(undefined, comment);
            });
        } else {
            callback(undefined, comment);
        }
    };

    // Hack to fill oldQuestions
    if (!dbComment.username) {
        QuestionNameService.findOrCreate(dbComment.questionId, dbComment.userId, function (err, username) {
            if (err) { return callback(err); }

            dbComment.username = username;
            dbComment.save(function (err) {
                if (err) { return callback(err); }

                processInternal();
            });
        });
    } else {
        processInternal();
    }
};


CommentService.create = function (text, userId, questionId, isAdmin, callback) {
    var comment = new Comment();
    comment.text = text.trim();
    comment.questionId = questionId;
    comment.userId = userId;

    // TODO Validation
    comment.save(function (err) {
        if (err) { return callback(err); }
        QuestionNameService.findOrCreate(comment.questionId, comment.userId, function (err, username) {
            if (err) { return callback(err); }

            if (isAdmin) {
                comment.username = 'Mummy';
            } else {
                comment.username = username;
            }
            comment.save(function (err) {
                if (err) { return callback(err); }

                QuestionService.incCommentCount(questionId, function (err) {
                    if (err) { return callback(err); }

                    callback(undefined, comment);

                    NotificationService.onQuestionCommented(questionId, comment._id);
                });
            });
        });
    });
};

CommentService.listByQuestion = function (questionId, userId, page, numItems, callback) {
    CommentService.listByQuestionInternal(questionId, page, numItems, function (err, comments) {
        if (err) { return callback(err); }

        Async.map(
            comments,
            function (dbComment, mapCallback) {
                processObject(dbComment, userId, mapCallback);
            },
            callback
        );
    });
};


CommentService.updateVoteScore = function (voteIncrement, score, newVote, commentId, userId, callback) {
    var conditions = {_id: commentId},
        update = {$inc: {voteScore: voteIncrement}},
        options = {multi: false};

    if (newVote) {
        update.$inc.nVotes = 1;

        if (score > 0) {
            update.$inc.nUpVotes = 1;
        } else {
            update.$inc.nDownVotes = 1;
        }
    } else {
        if (score > 0) {
            update.$inc.nUpVotes = 1;
            update.$inc.nDownVotes = -1;
        } else if (score < 0) {
            update.$inc.nUpVotes = -1;
            update.$inc.nDownVotes = 1;
        } else {
            // clear score
            update.$inc.nVotes = -1;

            if (voteIncrement > 0) {
                update.$inc.nDownVotes = -1;
            } else {
                update.$inc.nUpVotes = -1;
            }
        }
    }

    Comment.findOneAndUpdate(conditions, update, options,
        function (err, dbComment) {
            if (err) { return callback(err); }

            processObject(dbComment, userId, callback);
        });
};

CommentService.findCommentedQuestionIds = function (userId, page, numItems, callback) {
    // TODO improve this
    Comment.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {$sort: {created: -1}},
        {
            $group: {
                _id: '$questionId'
            }
        },
        {$skip: numItems * page},
        {$limit: numItems}
    ], function (err, results) {
        if (err) { return callback(err); }

        var questionIds = results.map(function (result) {
            return result._id;
        });
        callback(null, questionIds);
    });

};

// INTERNALS
CommentService.listByQuestionInternal = function (questionId, page, numItems, callback) {
    Comment.find(
        {questionId: questionId},
        null,
        {
            limit: numItems,
            skip: numItems * page
        }
    )
        .sort({field: 'desc', created: -1})
        .exec(callback);
};

CommentService.findById = function (commentId, callback) {
    Comment.findOne({_id: commentId}, callback);
};


CommentService.view = function (commentId, userId, callback) {
    Comment.findOne({_id: commentId}, function (err, dbComment) {
        if (err) { return callback(err); }

        processObject(dbComment, userId, callback);
    });
};

CommentService.getTotal = function (callback) {
    Comment.count({}, function (err, count) {
        callback(err, count);
    });
};

