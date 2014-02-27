var TestUtils = require('../utils/testutils');
var User = require('../apiclient/user');
var nUsers = 0;



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

