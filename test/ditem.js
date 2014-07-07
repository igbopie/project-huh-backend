var assert = require("assert");
var should = require('should');
var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var User = require('../apiclient/user');
var Item = require('../apiclient/item');
var nUsers = 2;
var users = null;



describe('Item', function(){

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

    describe('#create(PUBLIC)', function(){
        it('should create a media object',function (done) {
            Item.create(Item.TYPE_MESSAGE,"Test",null,41.2,41.2,10,Item.OPENABILITY_UNLIMITED,[],users[0].token,function(err){
                if(err) return done(err);
                done();
            });
		});
	});

    describe('#create(PRIVATE)', function(){
        it('should create a media object',function (done) {
            //TODO friendship
            Item.create(Item.TYPE_MESSAGE,"Test",null,41.2,41.2,10,Item.OPENABILITY_UNLIMITED,[users[1].id],users[0].token,function(err){
                if(err) return done(err);
                done();
            });
        });
    });


});