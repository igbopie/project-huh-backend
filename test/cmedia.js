var assert = require("assert")
var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var nUsers = 2;
var users = null;

describe('Media', function(){

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

    describe('#create()', function(){
        it('should create a media object',function (done) {
            this.timeout(5000);//S3 requires longer timeout
            Media.create("test/resources/testimage.jpg",users[0].token,function(err,data){
                if(err) return done(err);
                done();
            });
		});
	});

});