var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Comment = require('../apiclient/comment');
var nUsers = 5;
var users = null;
var question = {
    type: "WHAT",
    text: "time is it",
    latitude: 0,
    longitude: 0
};

describe('Comment', function () {

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users, function (err) {
                if (err) return done(err);

                question.token = users[0].token;
                Question.create(
                    question
                    ,
                    function (err, data) {
                        if (err) return done(err);

                        question._id = data._id;
                        done();
                    }
                );
            });
        });
    });


    describe('#create()', function () {
        it('should create a comment', function (done) {
            var comment = {
                text: "hello",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment, function (err) {
                done(err);
            });
        })
    });


    describe('#list()', function () {
        it('should list all comment', function (done) {
            var comment1 = {
                text: "hello1",
                questionId: question._id,
                token: users[0].token
            };
            var comment2 = {
                text: "hello2",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err) {
                Comment.create(comment2, function (err) {
                    Comment.list({questionId: question._id}, function (err, comments) {
                        if (err) return done(err);

                        comments.length.should.be.equal(2);

                        Question.commented({token: users[0].token}, function (err, questions) {
                            //console.log(questions);
                            done(err);
                        })

                    });
                });
            });
        })
    });

    describe('#trim()', function () {
        it('should list all comment', function (done) {
            var comment1 = {
                text: "       hello1     ",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err) {
                Comment.list({questionId: question._id}, function (err, comments) {
                    if (err) return done(err);

                    comments[0].text.should.be.equal("hello1");

                    done();
                });
            });
        })
    });

});



