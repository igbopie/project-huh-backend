var assert = require("assert");
var should = require('should');
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
            this.timeout(20000);//S3 requires longer timeout
            Media.create("test/resources/testimage.jpg",users[0].token,function(err,data){
                if(err) return done(err);
                should(data).be.ok;
                done();
            });
		});
	});
    describe('#get("thumb")', function(){
        it('should get a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Media.create("test/resources/testimage.jpg",users[0].token,function(err,data){
                if(err) return done(err);
                Media.get(data,"thumb",users[0].token,"test/resources/testimagedownloadedthumb.jpg",function(err){
                    if(err) return done(err);
                    done();
                });
            });
        });
    });

    describe('#get("large")', function(){
        it('should get a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Media.create("test/resources/testimage.jpg",users[0].token,function(err,data){
                if(err) return done(err);
                Media.get(data,"large",users[0].token,"test/resources/testimagedownloadedlarge.jpg",function(err){
                    if(err) return done(err);
                    done();
                });
            });
        });
    });
});