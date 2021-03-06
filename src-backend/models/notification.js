'use strict';
var mongoose = require('mongoose'),
    _ = require('lodash'),
    Schema = mongoose.Schema,
    Apn = require('../utils/apn'),
    Gcm = require('../utils/gcm'),
    Async = require('async');

var NOTIFICATION_TYPES = {
    ON_QUESTION_POSTED: 'OnQuestionPosted',
    ON_COMMENT_ON_MY_QUESTION: 'OnCommentOnMyQuestion',
    ON_COMMENT_ON_MY_COMMENT: 'OnCommentOnMyComment',
    ON_UP_VOTE_ON_MY_QUESTION: 'OnUpVoteOnMyQuestion',
    ON_DOWN_VOTE_ON_MY_QUESTION: 'OnDownVoteOnMyQuestion',
    ON_UP_VOTE_ON_MY_COMMENT: 'OnUpVoteOnMyComment',
    ON_DOWN_VOTE_ON_MY_COMMENT: 'OnDownVoteOnMyComment'
};

var notificationSchema = new Schema({
    message: {type: String, required: false},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    created: {type: Date, required: true, default: Date.now},
    deleted: {type: Date, required: false},
    read: {type: Boolean, required: true, default: false},
    type: {type: String, required: true},
    // DATA
    questionId: {type: Schema.Types.ObjectId, required: false, ref: 'Question'},
    commentId: {type: Schema.Types.ObjectId, required: false, ref: 'Comment'},
    yourCommentId: {type: Schema.Types.ObjectId, required: false, ref: 'Comment'}
});

notificationSchema.index({userId: 1, created: -1});
notificationSchema.index({userId: 1, read: 1});
notificationSchema.index({questionId: 1, created: -1});
notificationSchema.index({commentId: 1, created: -1});
notificationSchema.index({deleted: -1});

var Notification = mongoose.model('Notification', notificationSchema);

// Service?
var NotificationService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    NOTIFICATION_TYPES: NOTIFICATION_TYPES,
    Service: NotificationService
};


var CommentService = require('./comment').Service;
var QuestionService = require('./question').Service;
var UserService = require('./user').Service;
var SettingsService = require('./setting').Service;

var baseQuery = function (query) {
    return _.defaults(query, {deleted: {$exists: false}});
};

function fixedFromCharCode(codePt) {
    /*jslint bitwise: true */
    // Be careful, binary operators here
    if (codePt > 0xFFFF) {
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    return String.fromCharCode(codePt);
}

var heart = fixedFromCharCode(0x2764);
var skull = fixedFromCharCode(0x1F480);
var eyes = fixedFromCharCode(0x1F440);

function getQuestionText(question) {
    return question.typeId.word + ' ' + question.text + '?';
}
function sendNotification(type, userId, message, data) {

    var notification = new Notification();
    notification.type = type;
    notification.message = message;
    notification.userId = userId;
    notification.commentId = data.commentId;
    notification.yourCommentId = data.yourCommentId;
    notification.questionId = data.questionId;

    notification.save(function (err) {
        if (err) {
            console.error(err);
            return;
        }

        data.notificationId = notification._id;

        Notification.count(baseQuery({userId: userId, read: false}), function (err, badge) {
            if (err) { return console.error(err); }


            UserService.findById(userId, function (err, user) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!user) {
                    console.error('User not found:' + user);
                    return;
                }
                SettingsService.findOne(type, userId, function (err, setting) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (!setting.value) {
                        console.log('Notification is off');
                        return;
                    }

                    if (user.apnToken) {
                        Apn.send(user.apnToken, message, data, badge);
                    }
                    if (user.gcmToken) {
                        Gcm.send(user.gcmToken, message, data);
                    }
                    /*if (user.email) {
                     //Email.send(user.email, message);
                     }*/
                    console.log('Notification To:' + userId + ' Msg:' + message + ' Badge: ' + badge);
                });

            });
        });
    });
}
NotificationService.onQuestionCreated = function (questionId) {
    QuestionService.findById(questionId, function (err, question) {
        if (err || !question) { return; }

        UserService.findAll(function (err, users) {
            if (err || !users) { return; }
            users.forEach(function (user) {
                if (!user._id.equals(question.userId)) {
                    var text = eyes + ' \"' + getQuestionText(question) + '\"',
                        data = {
                            questionId: questionId
                        };
                    sendNotification(NOTIFICATION_TYPES.ON_QUESTION_POSTED, user._id, text, data);
                }
            });
        });
    });
};
NotificationService.onQuestionCommented = function (questionId, commentId) {
    QuestionService.findById(questionId, function (err, question) {
        if (err || !question) { return; }

        CommentService.findById(commentId, function (err, comment) {
            if (err || !comment) { return; }
            var page = 0,
                numItems = 1000,
                nextBatch,
                sendNotificatonProcess,
                doNotSendAgain = {},
                text = eyes + ' \"' + comment.text + '\" -> \"' + getQuestionText(question) + '\"',
                data = {
                    questionId: questionId,
                    commentId: commentId
                };

            doNotSendAgain[comment.userId] = true;

            // Send notification to author if not the same
            if (!doNotSendAgain[question.userId]) {
                sendNotification(NOTIFICATION_TYPES.ON_COMMENT_ON_MY_QUESTION, question.userId, text, data);
                doNotSendAgain[question.userId] = true;
            }

            sendNotificatonProcess = function (err, comments) {
                if (err || !comments || comments.length === 0) { return; }

                comments.forEach(function (otherComment) {
                    if (!doNotSendAgain[otherComment.userId]) {

                        var newData = _.defaults({
                            yourCommentId: otherComment._id
                        }, data);

                        doNotSendAgain[otherComment.userId] = true;
                        sendNotification(
                            NOTIFICATION_TYPES.ON_COMMENT_ON_MY_COMMENT,
                            otherComment.userId,
                            text,
                            newData);
                    }
                });

                nextBatch();
            };

            nextBatch = function () {
                CommentService.listByQuestionInternal(questionId, page, numItems, sendNotificatonProcess);

                page += 1;
            };

            nextBatch();
        });
    });
};

NotificationService.onQuestionUpVoted = function (questionId, userId) {
    QuestionService.findById(questionId, function (err, question) {
        if (err || !question) { return; }

        if (!question.userId.equals(userId)) {
            sendNotification(
                NOTIFICATION_TYPES.ON_UP_VOTE_ON_MY_QUESTION,
                question.userId,
                '+1 for \"' + getQuestionText(question) + '\"',
                {questionId: questionId}
            );
        }
    });
};

NotificationService.onQuestionDownVoted = function (questionId, userId) {
    QuestionService.findById(questionId, function (err, question) {
        if (err || !question) { return; }

        if (!question.userId.equals(userId)) {
            sendNotification(
                NOTIFICATION_TYPES.ON_DOWN_VOTE_ON_MY_QUESTION,
                question.userId,
                '-1 for \"' + getQuestionText(question) + '\"',
                {questionId: questionId}
            );
        }
    });
};

NotificationService.onCommentUpVoted = function (commentId, userId) {
    CommentService.findById(commentId, function (err, comment) {
        if (err || !comment) { return; }

        if (!comment.userId.equals(userId)) {
            sendNotification(
                NOTIFICATION_TYPES.ON_UP_VOTE_ON_MY_COMMENT,
                comment.userId,
                '+1 for \"' + comment.text + '\"',
                {
                    questionId: comment.questionId,
                    commentId: commentId
                }
            );
        }
    });
};


NotificationService.onCommentDownVoted = function (commentId, userId) {
    CommentService.findById(commentId, function (err, comment) {
        if (err || !comment) { return; }

        if (!comment.userId.equals(userId)) {
            sendNotification(
                NOTIFICATION_TYPES.ON_DOWN_VOTE_ON_MY_COMMENT,
                comment.userId,
                '-1 for \"' + comment.text + '\"',
                {
                    questionId: comment.questionId,
                    commentId: commentId
                }
            );
        }
    });
};

NotificationService.onQuestionDeleted = function (questionId) {
    Notification.update(
        {questionId: questionId},
        {deleted: Date.now()},
        {multi: true},
        function (err, numberAffected, raw) {}
    );
};

NotificationService.onCommentDeleted = function (commentId) {
    Notification.update(
        {commentId: commentId},
        {deleted: Date.now()},
        {multi: true},
        function (err, numberAffected, raw) {}
    );
};


NotificationService.list = function (userId, page, numItems, callback) {
    Notification.find(
        baseQuery({userId: userId}),
        null,
        {
            limit: numItems,
            skip: numItems * page
        }
    )
        .sort({field: 'desc', created: -1})
        .exec(function (err, notifications) {
            if (err) { return callback(err); }

            Async.map(
                notifications,
                function (dbNot, callback) {
                    var notification = {
                        type: dbNot.type,
                        message: dbNot.message,
                        questionId: dbNot.questionId,
                        commentId: dbNot.commentId,
                        yourCommentId: dbNot.yourCommentId,
                        created: dbNot.created,
                        read: dbNot.read
                    };

                    QuestionService.view(notification.questionId, userId, function (err, question) {
                        notification.question = question;

                        if (notification.commentId) {
                            CommentService.view(notification.commentId, userId, function (err, comment) {
                                notification.comment = comment;

                                if (notification.yourCommentId) {
                                    CommentService.view(notification.yourCommentId, userId, function (err, comment) {
                                        notification.yourComment = comment;
                                        callback(err, notification);
                                    });
                                } else {
                                    callback(err, notification);
                                }
                            });
                        } else {
                            callback(err, notification);
                        }
                    });
                },
                function (err, results) {
                    callback(err, results);
                }
            );
        });
};

NotificationService.markAllAsRead = function (userId, callback) {
    Notification.update(
        {userId: userId},
        {read: true},
        {multi: true},
        function (err, numberAffected, raw) {
            if (err) { return callback(err); }
            console.log('The number of updated documents was %d', numberAffected);
            console.log('The raw response from Mongo was ', raw);
            callback();
        }
    );
};
