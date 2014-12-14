var assert = require("assert")
var TestUtils = require('../utils/testutils');
var Friend = require('../apiclient/friend');
var User = require('../apiclient/user');
var nUsers = 5;
var users = null;

describe('Friend', function () {

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


  describe('#addFriend()', function () {
    it('should send a request to a user', function (done) {
      User.profile(users[1].username, users[0].token, function (err, profile) {
        if (err) return done(err);

        profile.isFriend.should.not.be.ok;
        Friend.addFriend(users[1].username, users[0].token, function (err) {
          if (err) return done(err);
          User.profile(users[1].username, users[0].token, function (err, profile) {
            if (err) return done(err);

            profile.isFriend.should.be.ok;
            done();
          });
        });
      });
    });
  });

  describe('#addFriendTwice()', function () {
    it('shouldnt send a friend request to someone who is already a friend', function (done) {
      Friend.addFriend(users[1].username, users[0].token, function (err) {
        if (err) return done(err);
        Friend.addFriend(users[1].username, users[0].token, function (err) {
          if (!err) return done("Should return an error!");
          done();
        });
      });
    });
  });

  describe('#AddAndListFriends()', function () {
    it('should add a friend and list it', function (done) {
      Friend.addFriend(users[1].username, users[0].token, function (err) {
        if (err) return done(err);
        Friend.friends(users[0].token, function (err, list) {
          if (err) return done(err);
          list.length.should.be.equal(1);
          list[0]._id.should.be.equal(users[1].id);
          done();
        });
      });
    });
  });

  describe('#sendFriendRequestAcceptAndDeleteFriend()', function () {
    it('should send a friend request to someone, accept it, and deleteFriend ', function (done) {
      Friend.addFriend(users[1].username, users[0].token, function (err) {
        if (err) return done(err);
        Friend.deleteFriend(users[1].id, users[0].token, function (err) {
          if (err) return done(err);
          Friend.friends(users[0].token, function (err, list) {
            if (err) return done(err);
            list.length.should.be.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('#blockFriend()', function () {
    it('should send a friend request to someone, accept it, and deleteFriend ', function (done) {
      Friend.block(users[1].id, users[0].token, function (err) {
        if (err) return done(err);

        Friend.blocked(users[0].token, function (err, list) {
          if (err) return done(err);

          list.length.should.be.equal(1);
          done();
        });
      });
    });
  });

  describe('#unblockFriend()', function () {
    it('should send a friend request to someone, accept it, and deleteFriend ', function (done) {
      Friend.block(users[1].id, users[0].token, function (err) {
        if (err) return done(err);

        Friend.unblock(users[1].id, users[0].token, function (err) {
          if (err) return done(err);
          Friend.blocked(users[0].token, function (err, list) {
            if (err) return done(err);

            list.length.should.be.equal(0);
            done();
          });
        });
      });
    });
  });

  describe('#search()', function () {
    it('should search', function (done) {
      Friend.addFriend(users[1].username, users[0].token, function (err) {
        if (err) return done(err);
        Friend.search(users[1].username, users[0].token, function (err, list) {
          if (err) return done(err);
          list.length.should.be.equal(1);
          list[0]._id.should.be.equal(users[1].id);
          done();
        });
      });
    });
  });

});



