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
        it('should follow a user',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                done();
			});
		});
	});

    describe('#sendFriendRequestTwice()', function(){
        it('should follow a user',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                done();
            });
        });
    });
    describe('#sendFriendRequestToAnAlreadyFriend()', function(){
        it('should follow a user',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err){
                if(err) return done(err);
                done();
            });
        });
    });


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


