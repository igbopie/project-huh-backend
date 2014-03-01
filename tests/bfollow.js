var TestUtils = require('../utils/testutils');
var Follow = require('../apiclient/follow');
var nUsers = 2;



exports.setUp = function (callback) {
	TestUtils.cleanDatabase(callback);
}


exports.follow = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Follow.follow(users[1].username,users[0].token,function(err,docs){
				test.ok(!err,"There was an error: "+err);
				test.done();			
			});
		});
	});
}

exports.followers = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Follow.follow(users[1].username,users[0].token,function(err,docs){
				Follow.followers(0,users[1].token,function(err,followers){
					test.ok(!err,"There was an error: "+err);
					test.equal(followers[0].followerUsername,users[0].username,"Invalid follower")
					test.done();
				});
			});
		});
	});
}

exports.following = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Follow.follow(users[1].username,users[0].token,function(err,docs){
				Follow.following( 0 , users[0].token , function(err,following){
					test.ok(!err,"There was an error: "+err);
					test.equal(following[0].followedUsername,users[1].username,"Invalid following")
					test.done();
				});
			});
		});
	});
}

exports.unfollow = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Follow.follow(users[1].username,users[0].token,function(err,docs){
				Follow.unfollow(users[1].username,users[0].token,function(err,following){
					test.ok(!err,"There was an error: "+err);
					test.done();
				});
			});
		});
	});
}


exports.notifications = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Follow.follow(users[1].username,users[0].token,function(err,docs){
				Follow.notification( users[1].token , function(err,notifications){
					test.ok(!err,"There was an error: "+err);
					test.equal(notifications.length,1,"Invalid notifications")
					test.done();
				});
			});
		});
	});
}



