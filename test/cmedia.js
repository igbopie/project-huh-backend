var assert = require("assert");
var should = require('should');
var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var nUsers = 2;
var users = null;
var media = null;

function testMedia(callback){
    if(media){
        callback();
    }else{
        Media.create("test/resources/testimage.jpg",function(err,data){
            if(err) return callback(err);
            callback();
        });
    }
}

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
            Media.create("test/resources/testimage.jpg",function(err,data){
                if(err) return done(err);
                media = data;
                should(data).be.ok;
                done();
            });
		});
	});
    describe('#get("thumb")', function(){
        it('should get a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            testMedia(function(){
                Media.get(media, "thumb", "test/resources/testimagedownloadedthumb.jpg", function (err) {
                        if (err) return done(err);
                        done();
                });
            });
        });
    });



    describe('#get("large")', function(){
        it('should get a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            testMedia(function(){
                Media.get(media,"large","test/resources/testimagedownloadedlarge.jpg",function(err){
                    if(err) return done(err);
                    done();
                });
            });
        });
    });
/*
    describe('#get("thumb") - unauthorized', function(){
        it('should get a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Media.create("test/resources/testimage.jpg",function(err,data){
                if(err) return done(err);
                Media.get(data,"thumb","test/resources/testimagedownloadedlarge.jpg",function(err,code){
                    if(code != 401) done("Invalid response code: "+code+". Expected 401 Unauthorized")
                    done();
                });
            });
        });
    });*/

    describe('#remove()', function(){
        it('should delete a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            testMedia(function(){
                Media.remove(media,users[0].token,function(err){
                    if(err) return done(err);
                    done();
                });
            });
        });
    });

});