var assert = require("assert")
var TestUtils = require('../utils/testutils');
var Friend = require('../apiclient/friend');
var User = require('../apiclient/user');
var nUsers = 5;
var users = null;

describe('Friend', function(){

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);
                    done();
                });
            });
        });
    });


    describe('#sendFriendRequest()', function(){
        it('should send a request to a user',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                done();
			});
		});
	});

    describe('#sendFriendRequestAndAnother()', function(){
        it('should send one request to a user and then to another one',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.sendFriendRequest(users[2].id,users[0].token,function(err) {
                    if (err) return done(err);
                    done();
                });
            });
        });
    });

    describe('#sendFriendRequestTwice()', function(){
        it('should send a request twice to the same user and return an error',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                    if (!err) return done("Should return an error!");
                    done();
                });
            });
        });
    });

    describe('#sendFriendRequestAndListIt()', function(){
        it('should follow a user',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.requests(users[1].token,function(err,list) {
                    if (err) return done(err);
                    //console.log(list);
                    list.length.should.be.equal(1);
                    done();
                });
            });
        });
    });

    describe('#acceptFriendRequest()', function(){
        it('should send a friend request and accept it',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.acceptFriendRequest(users[0].id,users[1].token,function(err){
                    if(err) return done(err);
                    done();
                })
            });
        });
    });
    describe('#sendFriendRequestToAnAlreadyFriend()', function(){
        it('shouldnt send a friend request to someone who is already a friend',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.acceptFriendRequest(users[0].id,users[1].token,function(err){
                    if(err) return done(err);
                    Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                        if (!err) return done("Should return an error!");
                        done();
                    });
                })
            });
        });
    });
    describe('#declineFriendRequest()', function(){
        it('should send a friend request and decline it',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.declineFriendRequest(users[0].id,users[1].token,function(err){
                    if(err) return done(err);
                    done();
                })
            });
        });
    });

    describe('#sendFriendRequestAcceptAndListFriends()', function(){
        it('should send a friend request to someone, accept it, and list it',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.acceptFriendRequest(users[0].id,users[1].token,function(err){
                    if(err) return done(err);
                    Friend.friends(users[0].token,function(err,list) {
                        if (err) return done(err);
                        list.length.should.be.equal(1);
                        Friend.friends(users[0].token,function(err,list) {
                            if (err) return done(err);
                            list.length.should.be.equal(1);
                            done();
                        });
                    });
                })
            });
        });
    });

    describe('#sendFriendRequestAcceptAndUnFriend()', function(){
        it('should send a friend request to someone, accept it, and unfriend ',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                Friend.acceptFriendRequest(users[0].id,users[1].token,function(err){
                    if(err) return done(err);
                    Friend.unfriend(users[1].id,users[0].token,function(err) {
                        if (err) return done(err);
                        Friend.friends(users[0].token,function(err,list) {
                            if (err) return done(err);
                            list.length.should.be.equal(0);
                            done();
                        });
                    });
                })
            });
        });
    });

});



