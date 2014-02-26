var User = require('../apiclient/user');

exports.list = function (test) {
	User.list(function(err,object){
		test.ok(!err,"There was an error: "+err);
	    test.ok(object != null, "List was null");
	    test.done();
	});
}


exports.login = function (test) {
	User.login("igbopie","123456",function(err,object){
		test.ok(!err,"There was an error: "+err);
	    test.ok(object != null, "Token was null");
	    test.done();
	});
}