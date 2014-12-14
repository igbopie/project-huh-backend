var assert = require("assert");
var should = require('should');
var TestUtils = require('../utils/testutils');
var Report = require('../apiclient/report');
var nUsers = 3;
var users = null;

describe('Report', function () {

  beforeEach(function (done) {
    //Clean and create some test users
    TestUtils.cleanDatabase(function (err) {
      if (err) return done(err);
      users = TestUtils.randomUsers(nUsers);
      TestUtils.createUsers(users, function (err) {
        if (err) return done(err);
        TestUtils.loginUsers(users, function (err) {
          if (err) return done(err);
          done();
        });
      });
    });
  });


  describe('#reportUser', function () {
    it('should report a user', function (done) {
      Report.create(null, null, users[1].id, "Bad user", users[0].token, function (err, data) {
        if (err) return done(err);

        done();
      });
    });
  });
});
