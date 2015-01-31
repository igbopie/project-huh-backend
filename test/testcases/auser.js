var assert = require("assert")
var should = require('should')
var TestUtils = require('../util/testutils');
var User = require('../apiclient/user');

describe('User', function () {

  beforeEach(function (done) {
    TestUtils.cleanDatabase(done);
  });


  describe('#create()', function () {
    it('should create a user', function (done) {
      User.create(function (err) {
        if (err) return done(err);

        done();
      });
    });
  });

});