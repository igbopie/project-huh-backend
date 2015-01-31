var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
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
        function (err) {
          if (err) return done(err);
          done();
        }
      );
    })
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

          Question.list(function(err, docs) {
            if (err) return done(err);

            docs.length.should.be.equal(1);

            console.log(docs);

            done();
          });
        }
      );
    })
  });


});



