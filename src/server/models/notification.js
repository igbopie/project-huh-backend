var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils'),
  Apn = require("../utils/apn"),
  Gcm = require("../utils/gcm")
  ;

var NOTIFICATION_TYPES = {
  ON_QUESTION_POSTED: "OnQuestionPosted",
  ON_COMMENT_ON_MY_QUESTION: "OnCommentOnMyQuestion",
  ON_COMMENT_ON_MY_COMMENT: "OnCommentOnMyComment",
  ON_UP_VOTE_ON_MY_QUESTION: "OnUpVoteOnMyQuestion",
  ON_DOWN_VOTE_ON_MY_QUESTION: "OnDownVoteOnMyQuestion",
  ON_UP_VOTE_ON_MY_COMMENT: "OnUpVoteOnMyComment",
  ON_DOWN_VOTE_ON_MY_COMMENT: "OnDownVoteOnMyComment"
};

var notificationSchema = new Schema({
  message: {type: String, required: false},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  read: {type: Boolean, required: true, default: false},
  type: {type: String, required: true},
  //DATA
  questionId: {type: Schema.Types.ObjectId, required: false, ref: "Question"},
  commentId: {type: Schema.Types.ObjectId, required: false, ref: "Comment"}
});

notificationSchema.index({userId: 1, created: -1});
notificationSchema.index({userId: 1, read: 1});
notificationSchema.index({questionId: 1, created: -1});

var Notification = mongoose.model('Notification', notificationSchema);

//Service?
var NotificationService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  NOTIFICATION_TYPES: NOTIFICATION_TYPES,
  Service: NotificationService
};


var CommentService = require('../models/comment').Service;
var QuestionService = require('../models/question').Service;
var UserService = require('../models/user').Service;
var SettingsService = require('../models/setting').Service;


function fixedFromCharCode (codePt) {
  if (codePt > 0xFFFF) {
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  else {
    return String.fromCharCode(codePt);
  }
}

var heart = fixedFromCharCode(0x2764);
var skull = fixedFromCharCode(0x1F480);
var eyes = fixedFromCharCode(0x1F440);

function getQuestionText(question){
  return question.typeId.word + " " + question.text + "?";
}
function sendNotification(type, userId, message, data) {

  var notification = new Notification();
  notification.type = type;
  notification.message = message;
  notification.userId = userId;
  notification.commentId = data.commentId;
  notification.questionId = data.questionId;

  notification.save(function(err) {
    if (err) {
      console.error(err);
      return;
    }

    data.notificationId = notification._id;

    Notification.count({ userId: userId, read: false }, function (err, badge) {
        if (err) return console.error(err);


      UserService.findById(userId, function (err, user) {
        if (err) {
          console.error(err);
          return;
        }
        if (!user) {
          console.error("User not found:" + user);
          return;
        }
        SettingsService.findOne(type, userId, function(err, setting){
          if (err) {
            console.error(err);
            return;
          }
          if (!setting.value) {
            console.log("Notification is off");
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
          console.log("Notification To:" + userId + " Msg:" + message + " Badge: "+ badge);
        });

      });
    });
  });
}
NotificationService.onQuestionCreated = function(questionId) {
  QuestionService.findById(questionId, function(err, question) {
    if (err || !question) return;

    UserService.findAll(function(err, users){
      if (err || !users) return;
      users.forEach(function(user){
        if (!user._id.equals(question.userId)) {
          var text = eyes+" \"" + getQuestionText(question) + "\"";
          var data = {
            questionId: questionId
          };
          sendNotification(NOTIFICATION_TYPES.ON_QUESTION_POSTED, user._id, text, data);
        }
      });
    });
  });
};
NotificationService.onQuestionCommented = function(questionId, commentId) {
  QuestionService.findById(questionId, function(err, question){
    if(err || !question) return;

    CommentService.findById(commentId, function(err, comment){
      if(err || !comment) return;
      var page = 0;
      var numItems = 1000;
      var nextBatch;
      var doNotSendAgain = {};

      var text = eyes+" \""+ comment.text +"\" -> \"" + getQuestionText(question) + "\"";
      var data = {
        questionId: questionId,
        commentId: commentId
      };

      doNotSendAgain[comment.userId] = true;

      // Send notification to author if not the same
      if (!doNotSendAgain[question.userId]) {
        sendNotification(NOTIFICATION_TYPES.ON_COMMENT_ON_MY_QUESTION, question.userId, text, data);
        doNotSendAgain[question.userId] = true;
      }

      var sendNotificatonProcess = function(err, comments) {
        if (err || !comments || comments.length === 0) return;

        comments.forEach(function(otherComment){
          if (!doNotSendAgain[otherComment.userId]) {

            doNotSendAgain[otherComment.userId] = true;
            sendNotification(NOTIFICATION_TYPES.ON_COMMENT_ON_MY_COMMENT, otherComment.userId, text, data);
          }
        });

        nextBatch();
      };

      nextBatch = function() {
        CommentService.listByQuestionInternal(questionId, page, numItems, sendNotificatonProcess);

        page++;
      };

      nextBatch();
    });
  });
};

NotificationService.onQuestionUpVoted = function(questionId, userId) {
  QuestionService.findById(questionId, function(err, question) {
    if (err || !question) return;

    if (!question.userId.equals(userId)) {
      sendNotification(NOTIFICATION_TYPES.ON_UP_VOTE_ON_MY_QUESTION, question.userId, "+1 for \"" + getQuestionText(question) + "\"", {questionId: questionId});
    }
  });
};

NotificationService.onQuestionDownVoted = function(questionId, userId) {
  QuestionService.findById(questionId, function(err, question) {
    if (err || !question) return;

    if (!question.userId.equals(userId)) {
      sendNotification(NOTIFICATION_TYPES.ON_DOWN_VOTE_ON_MY_QUESTION, question.userId, "-1 for \"" + getQuestionText(question) + "\"", {questionId: questionId});
    }
  });
};

NotificationService.onCommentUpVoted = function(commentId, userId) {
  CommentService.findById(commentId, function(err, comment) {
    if (err || !comment) return;

    if (!comment.userId.equals(userId)) {
      sendNotification(NOTIFICATION_TYPES.ON_UP_VOTE_ON_MY_COMMENT, comment.userId, "+1 for \"" + comment.text + "\"", {
        questionId: comment.questionId,
        commentId: commentId
      });
    }
  });
};


NotificationService.onCommentDownVoted = function(commentId, userId) {
  CommentService.findById(commentId, function(err, comment) {
    if (err || !comment) return;

    if (!comment.userId.equals(userId)) {
      sendNotification(NOTIFICATION_TYPES.ON_DOWN_VOTE_ON_MY_COMMENT, comment.userId, "-1 for \"" + comment.text + "\"", {
        questionId: comment.questionId,
        commentId: commentId
      });
    }
  });
};


NotificationService.list = function (userId, page, numItems, callback) {
  Notification.find(
    {userId:userId},
    null,
    {
      limit: numItems,
      skip: numItems * page
    })
    .sort({ field: 'desc', created: -1 })
    .exec(function(err, notifications){
      if(err) return callback(err);

      notifications = notifications.map(function(dbNot){
        return {
          type: dbNot.type,
          message: dbNot.message,
          questionId: dbNot.questionId,
          commentId: dbNot.commentId,
          created: dbNot.created,
          read: dbNot.read

        }
      });

      callback(null, notifications);

    });
};

NotificationService.markAllAsRead = function (userId, callback) {
  Notification.update(
    {userId:userId},
    {read: true},
    {multi: true}, function (err, numberAffected, raw) {
      if (err) return callback(err);
      console.log('The number of updated documents was %d', numberAffected);
      console.log('The raw response from Mongo was ', raw);
      callback();
    });
};