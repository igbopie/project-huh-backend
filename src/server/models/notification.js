var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils'),
  Apn = require("../utils/apn")
  ;



//Service?
var NotificationService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: NotificationService
};


var CommentService = require('../models/comment').Service;
var QuestionService = require('../models/question').Service;
var UserService = require('../models/user').Service;


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


function sendNotification(userId, message, data) {

  UserService.findById(userId, function (err, user) {
    if (err) {
      console.error(err);
      return;
    }
    if (!user) {
      console.error("User not found:" + user);
      return;
    }
    if (user.apnToken) {
      Apn.send(user.apnToken, message, data);
    }
    /*if (user.gcmToken) {
      Gcm.send(user.gcmToken, message, data);
    }
    if (user.email) {
      //Email.send(user.email, message);
    }*/
    console.log("Notification To:" + userId + " Msg:" + message);
  });
}
NotificationService.onQuestionCreated = function(questionId, qType) {
  QuestionService.findById(questionId, function(err, question) {
    if (err || !question) return;

    UserService.findAll(function(err, users){
      if (err || !users) return;
      users.forEach(function(user){
        if (!user._id.equals(question.userId)) {
          sendNotification(user._id, "WOOO! New question available: " + qType.word + " " + question.text, {
            questionId: questionId
          });
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
      CommentService.listByQuestionInternal(questionId, function(err, comments) {
        if (err || !comments) return;

        // Send notification to author
        sendNotification(question.userId, "Hey! "+eyes+" you have a new comment: "+ comment.text, {questionId: questionId, commentId:commentId});

        comments.forEach(function(comment){
          if (!comment.userId.equals(question.userId)) {
            sendNotification(comment.userId, "A question you commented has a new comment: " + comment.text, {
              questionId: questionId,
              commentId: commentId
            });
          }
        });
      });
    });
  });
};

NotificationService.onQuestionUpVoted = function(questionId) {
  QuestionService.findById(questionId, function(err, question) {
    if (err || !question) return;

    sendNotification(question.userId, "People love you "+heart+" Your question has been up voted.", {questionId: questionId});
  });
};

NotificationService.onQuestionDownVoted = function(questionId) {
  QuestionService.findById(questionId, function(err, question) {
    if (err || !question) return;

    sendNotification(question.userId, "Haters everywhere "+skull+" Your question has been down voted.", {questionId: questionId});
  });
};

NotificationService.onCommentUpVoted = function(commentId) {
  CommentService.findById(commentId, function(err, comment) {
    if (err || !comment) return;

    sendNotification(comment.userId, "People love you "+heart+" Your comment has been up voted.", {commentId: commentId});
  });
};


NotificationService.onCommentDownVoted = function(commentId) {
  CommentService.findById(commentId, function(err, comment) {
    if (err || !comment) return;

    sendNotification(comment.userId, "Haters everywhere "+skull+" Your comment has been down voted.", {commentId: commentId});
  });

};