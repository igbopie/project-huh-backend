var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Comment = require('../apiclient/comment');
var Vote = require('../apiclient/vote');
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

describe('Vote', function () {

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users, function (err) {
                if (err) return done(err);

                question.token = users[0].token;
                comment.token = users[0].token;
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

                            done();
                        });
                    }
                );
            });
        });
    });


    describe('#upVoteQuestion()', function () {
        it('should up vote a question', function (done) {
            Vote.up({questionId: question._id, token: users[0].token}, function (err) {
                if (err) return done(err);
                Vote.up({questionId: question._id, token: users[0].token}, function (err) {
                    if (err) return done(err);
                    Question.recent({userId: users[0]._id, token: users[0].token}, function (err, questions) {
                        if (err) return done(err);

                        questions[0].nVotes.should.be.equal(1);
                        questions[0].nUpVotes.should.be.equal(1);
                        questions[0].nDownVotes.should.be.equal(0);
                        questions[0].voteScore.should.be.equal(1);
                        questions[0].myVote.should.be.equal(1);

                        Question.favorites({token: users[0].token}, function (err, questions) {
                            if (err) return done(err);

                            questions[0]._id.should.be.equal(question._id);

                            done();
                        });
                    });
                });
            });
        })
    });

    describe('#downVoteQuestion()', function () {
        it('should down vote a question', function (done) {
            Vote.down({questionId: question._id, token: users[0].token}, function (err) {
                if (err) return done(err);
                Vote.down({questionId: question._id, token: users[0].token}, function (err) {
                    if (err) return done(err);
                    Question.recent({token: users[0].token}, function (err, questions) {
                        if (err) return done(err);

                        questions[0].nVotes.should.be.equal(1);
                        questions[0].nUpVotes.should.be.equal(0);
                        questions[0].nDownVotes.should.be.equal(1);
                        questions[0].voteScore.should.be.equal(-1);
                        questions[0].myVote.should.be.equal(-1);

                        done();
                    });
                });
            });
        })
    });

    describe('#changeVoteQuestion()', function () {
        it('should clear vote a question', function (done) {
            Vote.up({questionId: question._id, token: users[0].token}, function (err) {
                if (err) return done(err);
                Vote.down({questionId: question._id, token: users[0].token}, function (err) {
                    if (err) return done(err);
                    Question.recent({token: users[0].token}, function (err, questions) {
                        if (err) return done(err);

                        questions[0].nVotes.should.be.equal(1);
                        questions[0].nUpVotes.should.be.equal(0);
                        questions[0].nDownVotes.should.be.equal(1);
                        questions[0].voteScore.should.be.equal(-1);
                        questions[0].myVote.should.be.equal(-1);

                        Vote.clear({questionId: question._id, token: users[0].token}, function (err) {
                            if (err) return done(err);
                            Question.recent({token: users[0].token}, function (err, questions) {
                                if (err) return done(err);

                                questions[0].nVotes.should.be.equal(0);
                                questions[0].nUpVotes.should.be.equal(0);
                                questions[0].nDownVotes.should.be.equal(0);
                                questions[0].voteScore.should.be.equal(0);
                                should.not.exist(questions[0].myVote);

                                done();
                            });
                        });
                    });
                });
            });
        })
    });

    describe('#upVoteComment()', function () {
        it('should up vote a comment', function (done) {
            Vote.up({commentId: comment._id, token: users[0].token}, function (err) {
                if (err) return done(err);
                Vote.up({commentId: comment._id, token: users[0].token}, function (err) {
                    if (err) return done(err);
                    Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                        if (err) return done(err);

                        comments[0].nVotes.should.be.equal(1);
                        comments[0].nUpVotes.should.be.equal(1);
                        comments[0].nDownVotes.should.be.equal(0);
                        comments[0].voteScore.should.be.equal(1);
                        comments[0].myVote.should.be.equal(1);

                        done();
                    });
                });
            });
        })
    });

    describe('#downVoteComment()', function () {
        it('should down vote a comment', function (done) {
            Vote.down({commentId: comment._id, token: users[0].token}, function (err) {
                if (err) return done(err);
                Vote.down({commentId: comment._id, token: users[0].token}, function (err) {
                    if (err) return done(err);
                    Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                        if (err) return done(err);


                        comments[0].nVotes.should.be.equal(1);
                        comments[0].nUpVotes.should.be.equal(0);
                        comments[0].nDownVotes.should.be.equal(1);
                        comments[0].voteScore.should.be.equal(-1);
                        comments[0].myVote.should.be.equal(-1);

                        done();
                    });
                });
            });
        })
    });
    describe('#changeVoteComment()', function () {
        it('should clear vote a comment', function (done) {
            Vote.up({commentId: comment._id, token: users[0].token}, function (err) {
                if (err) return done(err);
                Vote.down({commentId: comment._id, token: users[0].token}, function (err) {
                    if (err) return done(err);
                    Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                        if (err) return done(err);

                        comments[0].nVotes.should.be.equal(1);
                        comments[0].nUpVotes.should.be.equal(0);
                        comments[0].nDownVotes.should.be.equal(1);
                        comments[0].voteScore.should.be.equal(-1);
                        comments[0].myVote.should.be.equal(-1);

                        Vote.clear({commentId: comment._id, token: users[0].token}, function (err) {
                            if (err) return done(err);
                            Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                                if (err) return done(err);

                                comments[0].nVotes.should.be.equal(0);
                                comments[0].nUpVotes.should.be.equal(0);
                                comments[0].nDownVotes.should.be.equal(0);
                                comments[0].voteScore.should.be.equal(0);
                                should.not.exist(comments[0].myVote);

                                done();
                            });
                        });
                    });
                });
            });
        })
    });

});



