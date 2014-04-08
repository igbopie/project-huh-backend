var assert = require("assert")
var TestUtils = require('../utils/testutils');
var Follow = require('../apiclient/follow');
var nUsers = 2;
var users = null;

describe('Follow', function(){

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


    describe('#follow()', function(){
        it('should follow a user',function (done) {
	        Follow.follow(users[1].username,users[0].token,function(err){
                if(err) return done(err);
				done();
			});
		});
	});


    describe('#followers()', function(){
        it('should list the followers of a user',function (done) {
            Follow.follow(users[1].username,users[0].token,function(err,docs){
                if(err) return done(err);
			    Follow.followers(0,users[1].username,function(err,followers){
                    if(err) return done(err);

                    followers[0].followerUsername.should.be.equal(users[0].username);

                    done();
				});
			});
		});
    });

    describe('#following()', function(){
        it('should list the followings of a user',function (done) {
			Follow.follow(users[1].username,users[0].token,function(err,docs){
                if(err) return done(err);
				Follow.following( 0 , users[0].username , function(err,following){
                    if(err) return done(err);

                    following[0].followedUsername.should.be.equal(users[1].username);

					done();
				});
			});
		});
	});


    describe('#unfollow()', function(){
        it('should list the unfollow a user',function (done) {
			Follow.follow(users[1].username,users[0].token,function(err){
                if(err) return done(err);
				Follow.unfollow(users[1].username,users[0].token,function(err){
                    if(err) return done(err);

					done();
				});
			});
		});
	});

    describe('#notifications()', function(){
        it('should list the notifications a user',function (done) {
			Follow.follow(users[1].username,users[0].token,function(err,docs){
                if(err) return done(err);
				Follow.notification( users[1].token , function(err,notifications){
                    if(err) return done(err);

					notifications.should.be.length(1);

					done();
				});
			});
		});
	});
});


