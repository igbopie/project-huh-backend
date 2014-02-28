var TestUtils = require('../utils/testutils');
var Friends = require('../apiclient/friends');
var nUsers = 2;



exports.setUp = function (callback) {
	TestUtils.cleanDatabase(callback);
}


exports.list = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Friends.add(users[1].username,users[0].token,function(err,docs){
				Friends.accept(users[0].username,users[1].token,function(err){
					Friends.list(users[0].token,function(err,friends){
						test.ok(!err,"There was an error: "+err);
						test.equal(friends[0].friendUsername,users[1].username,"Invalid friend username")
						test.done();
					});
				});	
			});
		});
	});
}


exports.add = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Friends.add(users[1].username,users[0].token,function(err,docs){
				test.ok(!err,"There was an error: "+err);
				test.done();			
			});
		});
	});
}

exports.pending = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Friends.add(users[1].username,users[0].token,function(err,docs){
				Friends.pending(users[1].token,function(err,pendings){
					test.ok(!err,"There was an error: "+err);
					test.equal(pendings.length,1,"A pending friend request was expected");
					test.equal(pendings[0].friendUsername,users[0].username,"A pending friend request was expected");
					test.done();
				});
						
			});
		});
	});
}

exports.accept = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Friends.add(users[1].username,users[0].token,function(err,docs){
				Friends.accept(users[0].username,users[1].token,function(err){
					test.ok(!err,"There was an error: "+err);
					test.done();
				});
						
			});
		});
	});
}

exports.decline = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Friends.add(users[1].username,users[0].token,function(err,docs){
				Friends.decline(users[0].username,users[1].token,function(err){
					test.ok(!err,"There was an error: "+err);
					test.done();
				});
						
			});
		});
	});
}

exports.remove = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){			
			Friends.add(users[1].username,users[0].token,function(err,docs){
				Friends.accept(users[0].username,users[1].token,function(err){
					Friends.remove(users[0].username,users[1].token,function(err){
						test.ok(!err,"There was an error: "+err);
						test.done();
					});
				});
						
			});
		});
	});
}



