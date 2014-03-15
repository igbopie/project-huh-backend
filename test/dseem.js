var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var Seem = require('../apiclient/seem');
var nUsers = 2;
var users = null;
/* NOT IMPLEMENTED---
describe('Seem', function(){

    beforeEach(function (done) {

        this.timeout(5000);//S3 requires longer timeout
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);
                    Media.create("test/resources/testimage.jpg",users[0].token,function(err,data){
                        if(err) return done(err);
                        users[0].mediaId = data;
                        Seem.create("A caption for the photo",users[0].mediaId,users[0].token,function(err,data){
                            if (err) return done(err);
                            users[0].seemId = data;
                            done();
                        });
                    });
                });
            });
        });
    });
    describe('#create()', function(){
        it('should create a seem',function (done) {
            this.timeout(5000);//S3 requires longer timeout
	        Seem.create("A caption for the photo",users[0].mediaId,users[0].token,function(err){
                if (err) return done(err);
                done();
            });
	    });
    });

    describe('#get()', function(){

        this.timeout(5000);//S3 requires longer timeout
        it('should get a seem',function (done) {
            Seem.get(users[0].seemId,users[0].token,function(err){
                if (err) return done(err);
                done();
            });
        });
    });


});*/