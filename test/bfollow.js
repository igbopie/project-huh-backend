var assert = require("assert")
var TestUtils = require('../utils/testutils');
var Follow = require('../apiclient/follow');
var User = require('../apiclient/user');
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


    describe('#followyourself()', function(){
        it('shouldnt follow followyourself',function (done) {
            Follow.follow(users[0].username,users[0].token,function(err){
                if(!err) return done("Should return an error");
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

    describe('#followUserProfile()', function(){
        it('should return that I follow that user',function (done) {
            Follow.follow(users[1].username,users[0].token,function(err,docs){
                if(err) return done(err);
                User.profile(users[1].username,users[0].token,function(err,profile){
                    if(err) return done(err);
                    //console.log(profile);
                    profile.isFollowedByMe.should.be.ok;
                    profile.isFollowingMe.should.be.not.ok;

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

    describe('#followMaxLimit()', function(){
        it('should follow a user',function (done) {

            this.timeout(60000);//S3 requires longer timeout
            //Clean and create some test users
            TestUtils.cleanDatabase(function(err){
                if(err) return done(err);
                users = TestUtils.randomUsers(1010);
                TestUtils.createUsers(users,function(err){
                    if(err) return done(err);
                    User.login(users[0].username,users[0].password,function(err,token){
                        if(err) return done(err);
                        followMaxLimitAux(1,token,0,function(err,data){
                            if(err){
                                if(data == 471){
                                    return done();
                                }else{
                                    return done(err);
                                }
                            }
                            return done("Should return an error here");
                        });
                    });
                });
            });

        });
    })
});


function followMaxLimitAux(index,followerToken,count,callback){
    if(index < users.length){
        Follow.follow(users[index].username,followerToken,function(err,data){
            if(err){
                return callback(err,data);
            }
            followMaxLimitAux(index+1,followerToken,count+1,callback);
        });
    }else{
        callback()
    }
}


