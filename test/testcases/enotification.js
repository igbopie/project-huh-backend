var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Comment = require('../apiclient/comment');
var Vote = require('../apiclient/vote');
var Notification = require('../apiclient/notification');
var should = require('should');
var _ = require('lodash');
var nUsers = 5;
var users = null;
var question = {
    type: "WHAT",
    text: "time is it",
    latitude: 0,
    longitude: 0
};
var comment = {
    text: "hello"
};

describe('Notification', function () {

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users, function (err) {
                if (err) return done(err);

                question.token = users[0].token;
                comment.token = users[1].token;
                Question.create(
                    question
                    ,
                    function (err, data) {
                        if (err) return done(err);

                        question._id = data._id;
                        comment.questionId = question._id;

                        Comment.create(comment, function (err, data) {
                            if (err) return done(err);

                            comment._id = data._id;
                            comment.token = users[2].token;

                            Comment.create(comment, function (err, data) {
                                if (err) return done(err);

                                done();
                            });
                        });
                    }
                );
            });
        });
    });


    describe('#notifications()', function () {
        it('should up vote a question', function (done) {
            Vote.up({questionId: question._id, token: users[1].token}, function (err) {
                if (err) return done(err);
                Vote.up({questionId: question._id, token: users[2].token}, function (err) {
                    if (err) return done(err);

                    Notification.list({token: users[0].token}, function (err, notifications) {
                        Notification.markAllAsRead({token: users[0].token}, function (err, notifications) {
                            Notification.list({token: users[0].token}, function (err, notifications) {
                                Notification.list({token: users[1].token}, function (err, notifications) {

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        })
    });

    describe('#notificationsDelete()', function () {
        it('should delete notification', function (done) {
            this.timeout(5000);
            TestUtils.populateDB(function(err, db){
                if (err) return done(err);
                Notification.list({token: db.users[0].token}, function (err, notifications) {
                    if (err) return done(err);

                    var questionId = notifications[0].questionId;
                    Question.delete({token: db.adminUser.token, questionId: questionId}, function(err) {
                        if (err) return done(err);

                        Notification.list({token: db.users[0].token}, function (err, notifications) {
                            if (err) return done(err);

                            _.each(notifications, function(notification){
                                questionId.should.not.be.equal(notification.questionId);
                            });

                            done();
                        });
                    });
                });
            });

        })
    });

    describe('#notificationsDeleteComment()', function () {
        it('should delete notification', function (done) {
            this.timeout(5000);
            TestUtils.populateDB(function(err, db){
                if (err) return done(err);
                Notification.list({token: db.users[0].token}, function (err, notifications) {
                    if (err) return done(err);

                    var commentId;
                    _.each(notifications, function(notification){
                        if (notification.commentId) {
                            commentId = notification.commentId;
                            return false;
                        }
                    });

                    if (!commentId) {
                        return done("Should have commentId");
                    }

                    Comment.delete({token: db.adminUser.token, commentId: commentId}, function(err) {
                        if (err) return done(err);

                        Notification.list({token: db.users[0].token}, function (err, notifications) {
                            if (err) return done(err);

                            _.each(notifications, function(notification){
                                commentId.should.not.be.equal(notification.commentId);
                            });

                            done();
                        });
                    });
                });
            });

        })
    });


});



