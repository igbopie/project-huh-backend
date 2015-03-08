var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Flag = require('../apiclient/flag');
var nUsers = 5;
var users = null;

describe('Question', function () {

  beforeEach(function (done) {
    //Clean and create some test users
    TestUtils.cleanDatabase(function (err) {
      if (err) return done(err);
      users = TestUtils.randomUsers(nUsers);
      TestUtils.createUsers(users, function (err) {
        if (err) return done(err);
        done();
      });
    });
  });


  describe('#create()', function () {
    it('should create a question', function (done) {
      Question.create(
        {
          userId: users[0]._id,
          type: "WHAT",
          text: "time is it",
          latitude: 0,
          longitude: 0
        },
        function (err, question) {
          if (err) return done(err);

          Flag.flag({questionId: question._id, userId: users[0]._id, reason: "HATE"}, function(err) {
            if (err) return done(err);

            done();
          });
        }
      );
    })
  });

  describe('#view()', function () {
    it('should view a question', function (done) {
      Question.create(
        {
          userId: users[0]._id,
          type: "WHAT",
          text: "time is it",
          latitude: 0,
          longitude: 0
        },
        function (err, question) {
          if (err) return done(err);

          Question.view({questionId: question._id, userId:  users[0]._id}, function(err, questionViewed) {
            if (err) return done(err);
            if (!questionViewed) return done("no question");

            questionViewed._id.should.be.equal(question._id);

            done();
          });
        }
      );
    });
  });

  describe('#list()', function () {
    it('should list a question', function (done) {
      Question.create(
        {
          userId: users[0]._id,
          type: "WHAT",
          text: "time is it",
          latitude: 0,
          longitude: 0
        },
        function (err) {
          if (err) return done(err);

          Question.recent({}, function (err, docs) {
            if (err) return done(err);

            docs.length.should.be.equal(1);

            Question.popular({}, function (err, docs) {
              if (err) return done(err);

              docs.length.should.be.equal(1);

              Question.trending({}, function (err, docs) {
                if (err) return done(err);

                docs.length.should.be.equal(1);

                Question.near({
                  latitude: 0.01,
                  longitude: 0.01}, function (err, docs) {
                  if (err) return done(err);

                  docs.length.should.be.equal(1);

                  done();
                });
              });
            });
          });
        }
      );
    })
  });


})
;



