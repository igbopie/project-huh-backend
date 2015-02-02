var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Comment = require('../apiclient/comment');
var Vote = require('../apiclient/vote');
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

        question.userId = users[0]._id;
        comment.userId = users[0]._id;
        Question.create(
          question
          ,
          function (err, data) {
            if (err) return done(err);

            question._id = data._id;
            comment.questionId = question._id;

            Comment.create(comment, function(err, data) {
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
      Vote.up({questionId: question._id, userId: users[0]._id}, function(err) {
        if (err) return done(err);
        Vote.up({questionId: question._id, userId: users[0]._id}, function(err) {
          if (err) return done(err);
          Question.list({userId:users[0]._id}, function(err, questions){
            if (err) return done(err);

            questions[0].myVote.should.be.equal(1);

            done();
          });
        });
      });
    })
  });

  describe('#downVoteQuestion()', function () {
    it('should down vote a question', function (done) {
      Vote.down({questionId: question._id, userId: users[0]._id}, function(err) {
        if (err) return done(err);
        Vote.down({questionId: question._id, userId: users[0]._id}, function(err) {
          if (err) return done(err);
          Question.list({userId:users[0]._id}, function(err, questions){
            if (err) return done(err);

            questions[0].myVote.should.be.equal(-1);

            done();
          });
        });
      });
    })
  });

  describe('#upVoteComment()', function () {
    it('should up vote a comment', function (done) {
      Vote.up({commentId: comment._id, userId: users[0]._id}, function(err) {
        if (err) return done(err);
        Vote.up({commentId: comment._id, userId: users[0]._id}, function(err) {
          if (err) return done(err);
          Comment.list({userId:users[0]._id}, function(err, comments){
            if (err) return done(err);

            comments[0].myVote.should.be.equal(1);

            done();
          });
        });
      });
    })
  });

  //TODO improve test cases


});



