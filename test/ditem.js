var assert = require("assert");
var should = require('should');
var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var User = require('../apiclient/user');
var Item = require('../apiclient/item');
var Friend = require('../apiclient/friend');
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
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                Friend.acceptFriendRequest(users[0].id, users[1].token, function (err) {
                    if (err) return done(err);

                    Item.create(Item.TYPE_MESSAGE, "Test", null, 41.2, 41.2, 10, Item.OPENABILITY_UNLIMITED, [users[1].id], users[0].token, function (err) {
                        if (err) return done(err);
                        done();
                    });
                });
            });
        });
    });

    describe('#open()', function(){
        it('should open',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE,"Test",null,40.665006,-3.779096,10,Item.OPENABILITY_UNLIMITED,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.open(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(!err) return done("Should return an error");
                    done();
                })
            });
        });
    });

    describe('#open()', function(){
        it('should open',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE,"Test",null,40.665006,-3.779096,50,Item.OPENABILITY_UNLIMITED,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.open(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(err) return done(err);
                    done();
                })
            });
        });
    });

    describe('#searchInboxByLocationInRange()', function(){
        it('should search',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                Friend.acceptFriendRequest(users[0].id, users[1].token, function (err) {
                    if (err) return done(err);
                    //LAT       LONG
                    //40.665006, -3.779096
                    //40.665350, -3.778955
                    // 40 m
                    Item.create(Item.TYPE_MESSAGE, "Test", null, 40.665006, -3.779096, 50, Item.OPENABILITY_UNLIMITED, [users[1].id], users[0].token, function (err, itemId) {
                        if (err) return done(err);
                        Item.searchInboxByLocation(false, 40.665350, -3.778955, 41, users[1].token, function (err,data) {
                            if (err) return done(err);
                            data.length.should.be.equal(1);
                            done();
                        })
                    });
                });
            });
        });
    });

    describe('#searchInboxByLocationNotMyInbox()', function(){
        it('should search',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                Friend.acceptFriendRequest(users[0].id, users[1].token, function (err) {
                    if (err) return done(err);
                    //LAT       LONG
                    //40.665006, -3.779096
                    //40.665350, -3.778955
                    // 40 m
                    Item.create(Item.TYPE_MESSAGE, "Test", null, 40.665006, -3.779096, 50, Item.OPENABILITY_UNLIMITED, [users[1].id], users[0].token, function (err, itemId) {
                        if (err) return done(err);
                        Item.searchInboxByLocation(false, 40.665350, -3.778955, 50, users[0].token, function (err,data) {
                            if (err) return done(err);
                            data.length.should.be.equal(0);
                            done();
                        })
                    });
                });
            });
        });
    });

    describe('#searchInboxByLocationOutOfRange()', function(){
        it('should search',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                Friend.acceptFriendRequest(users[0].id, users[1].token, function (err) {
                    if (err) return done(err);
                    //LAT       LONG
                    //40.665006, -3.779096
                    //40.665350, -3.778955
                    // 40 m
                    Item.create(Item.TYPE_MESSAGE, "Test", null, 40.665006, -3.779096, 50, Item.OPENABILITY_UNLIMITED, [users[1].id], users[0].token, function (err, itemId) {
                        if (err) return done(err);
                        Item.searchInboxByLocation(false, 40.665350, -3.778955, 39, users[1].token, function (err,data) {
                            if (err) return done(err);
                            data.length.should.be.equal(0);
                            done();
                        })
                    });
                });
            });
        });
    });



    describe('#searchInboxByLocationAlreadyOpened()', function(){
        it('should search',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                Friend.acceptFriendRequest(users[0].id, users[1].token, function (err) {
                    if (err) return done(err);
                    //LAT       LONG
                    //40.665006, -3.779096
                    //40.665350, -3.778955
                    // 40 m
                    Item.create(Item.TYPE_MESSAGE, "Test", null, 40.665006, -3.779096, 50, Item.OPENABILITY_UNLIMITED, [users[1].id], users[0].token, function (err, itemId) {
                        if (err) return done(err);
                        Item.open(itemId,40.665350,-3.778955,users[1].token,function(err) {
                            if (err) return done(err);
                            Item.searchInboxByLocation(false, 40.665350, -3.778955, 50, users[1].token, function (err, data) {
                                if (err) return done(err);
                                data.length.should.be.equal(0);
                                done();
                            })
                        });
                    });
                });
            });
        });
    });
});