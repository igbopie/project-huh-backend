var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var nUsers = 2;



exports.setUp = function (callback) {
	TestUtils.cleanDatabase(callback);
}


exports.create = function (test) {
	var users = TestUtils.randomUsers(nUsers);
	TestUtils.createUsers(users,function(){
		TestUtils.loginUsers(users,test,function(){
            Media.create("/Users/igbopie/git/work-seembackend/tests/resources/testimage.jpg",users[0].token,function(err){
                test.ok(!err,"There was an error: "+err);
                test.done();
            });
		});
	});

}


