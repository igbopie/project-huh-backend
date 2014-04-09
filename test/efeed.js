var assert = require("assert")
var TestUtils = require('../utils/testutils');
var Feed = require('../apiclient/feed');
var should = require('should')
var Media = require('../apiclient/media');
var Seem = require('../apiclient/seem');
var Follow = require('../apiclient/follow');
var nUsers = 2;
var nSeems = 2;
var nItems = 10;
var users = null;
var media = "5343ce700ceeccdd20189502";//fake

describe('Feed', function(){

    this.timeout(60000);//S3 requires longer timeout
    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);
                    followAux(1,users[0].token,function(err){
                        if(err) return done(err);
                        TestUtils.createSeemsAndItems(nSeems,nItems,users,function (err) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });
    });
    describe('#feed()', function(){
        it('should fetch the news feed',function (done) {
            Feed.feed(0,users[0].token,function(err,data){
                if (err) return done(err);
                data.length.should.be.above(1);
                done();
            })
        });
    });
    describe('#feedByUser()', function(){
        it('should fetch the news feed',function (done) {
            Feed.feedByUser(0,users[1].username,function(err,data){
                if (err) return done(err);
                data.length.should.be.above(1);
                done();
            })
        });
    });


});

function followAux(index,followerToken,callback){
    if(index < users.length){
        Follow.follow(users[index].username,followerToken,function(err){
            if(err) return callback(err);
            followAux(index+1,followerToken,callback);
        });
    }else{
        callback()
    }
}

