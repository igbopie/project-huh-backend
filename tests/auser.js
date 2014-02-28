var TestUtils = require('../utils/testutils');
var User = require('../apiclient/user');
var nUsers = 10;



exports.setUp = function (callback) {
	TestUtils.cleanDatabase(callback);
}

exports.create = function (test) {
	User.create("igbopie@gmail.com","igbopie","123456",function(err){
		test.ok(!err,"There was an error: "+err);
	    test.done();
	});
}


exports.login = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){
		    test.done();
		});
	});
}

exports.addPhone = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){
			User.addPhone("12345678",users[0].token,function(err){
				test.ok(!err,"There was an error: "+err);
	       		test.done();
			});
		});
	});
}

exports.verifyPhone = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){
			User.addPhone("12345678",users[0].token,function(err){
				TestUtils.findDBUser(users[0].username,function(err,dbUser){
					User.verifyPhone("12345678",dbUser.phoneVerificationCode,users[0].token,function(err,obj){
						test.ok(!err,"There was an error: "+err);
						test.equal(obj,true,"Phone was not verified "+obj);
						test.done();	
					});
				});
			});
		});
	});
}

