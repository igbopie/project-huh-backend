var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Comment = require('../apiclient/comment');
var Vote = require('../apiclient/vote');
var Notification = require('../apiclient/notification');
var should = require('should');
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

                question.userId = users[0]._id;
                comment.userId = users[1]._id;
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
                            comment.userId = users[2]._id;

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
            Vote.up({questionId: question._id, userId: users[1]._id}, function (err) {
                if (err) return done(err);
                Vote.up({questionId: question._id, userId: users[2]._id}, function (err) {
                    if (err) return done(err);

                    Notification.list({userId: users[0]._id}, function (err, notifications) {
                        Notification.markAllAsRead({userId: users[0]._id}, function (err, notifications) {
                            Notification.list({userId: users[0]._id}, function (err, notifications) {
                                Notification.list({userId: users[1]._id}, function (err, notifications) {

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        })
    });


});



