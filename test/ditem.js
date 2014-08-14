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
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1,null,41.2,41.2,10,[],users[0].token,function(err){
                if(err) return done(err);
                done();
            });
		});
	});

    describe('#create(PRIVATE)', function(){
        it('should create a media object',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 41.2, 41.2, 10, [users[1].id], users[0].token, function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        });
    });

    describe('#collect()', function(){
        it('should collect',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1,null,40.665006,-3.779096,10,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(!err) return done("Should return an error");
                    done();
                })
            });
        });
    });

    describe('#collect()', function(){
        it('should collect',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1,null,40.665006,-3.779096,50,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(err) return done(err);
                    done();
                })
            });
        });
    });

    describe('#collectAndDisappear()', function(){
        it('should collect and disappear',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1,null,40.665006,-3.779096,50,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(err) return done(err);
                    Item.searchByLocation(40.665350, -3.778955, 100, users[1].token, function (err,data) {
                        if (err) return done(err);
                        data.public.length.should.be.equal(0);
                        done();
                    })
                })
            });
        });
    });

    describe('#leave()', function(){
        it('should leave',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1,null,40.665006,-3.779096,50,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(err) return done(err);
                    Item.leave(itemId,users[1].token,function(err) {
                        if(err) return done(err);
                        done();
                    });
                })
            });
        });
    });

    describe('#leaveByOther()', function(){
        it('shouldnt leave',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1,null,40.665006,-3.779096,50,[],users[0].token,function(err,itemId){
                if(err) return done(err);
                Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err){
                    if(err) return done(err);
                    Item.leave(itemId,users[0].token,function(err) {
                        if(!err) return done("It should return error");
                        done();
                    });
                })
            });
        });
    });


    describe('#searchInboxByLocationInRange()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE,  "Title Test","Test",1, null, 40.665006, -3.779096, 50, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.searchByLocationUserLocation(40.665350, -3.778955, 41,40.665350, -3.778955, users[1].token, function (err,data) {
                        if (err) return done(err);
                        data.sentToMe.length.should.be.equal(1);
                        data.sentToMe[0].canCollect.should.be.ok;
                        done();
                    })
                });
            });
        });
    });

    describe('#searchByLocationNotMyInbox()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 50, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.searchByLocation(40.665350, -3.778955, 50, users[0].token, function (err,data) {
                        if (err) return done(err);

                        data.sentToMe.length.should.be.equal(0);
                        done();
                    })
                });
            });
        });
    });

    describe('#searchInboxByLocationOutOfRange()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].id,users[0].token,function(err) {
                if (err) return done(err);
                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 50, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.searchByLocation(40.665350, -3.778955, 39, users[1].token, function (err,data) {
                        if (err) return done(err);
                        data.sentToMe.length.should.be.equal(0);
                        done();
                    })
                });
            });
        });
    });



    describe('#searchInboxByLocationAlreadyOpened()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 100, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err) {
                        if (err) return done(err);
                        Item.searchByLocation( 40.665350, -3.778955, 50, users[1].token, function (err, data) {
                            if (err) return done(err);
                            data.sentToMe.length.should.be.equal(0);
                            //data.opened.length.should.be.equal(1);
                            done();
                        })
                    });
                });
            });
        });
    });
    /*
    describe('#searchInboxByLocationPublic()', function(){
        it('should search',function (done) {
            Friend.sendFriendRequest(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                Friend.acceptFriendRequest(users[0].id, users[1].token, function (err) {
                    if (err) return done(err);
                    //LAT       LONG
                    //40.665006, -3.779096
                    //40.665350, -3.778955
                    // 40 m
                    Item.create(Item.TYPE_MESSAGE, "Title Test", "Test", null, 40.665006, -3.779096, 100, [], users[0].token, function (err, itemId) {
                        if (err) return done(err);
                        Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err) {
                            if (err) return done(err);
                            Item.searchByLocation( 40.665350, -3.778955, 50, users[1].token, function (err, data) {
                                if (err) return done(err);
                                data.public.length.should.be.equal(1);
                                done();
                            })
                        });
                    });
                });
            });
        });
    });
    */


    describe('#viewCollected()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 100, [], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err) {
                        if (err) return done(err);
                        Item.view(itemId, users[1].token, function (err, data) {
                            if (err) return done(err);
                            data.should.have.property('type');
                            data.should.have.property('message');
                            done();
                        })
                    });
                });
            });
        });
    });

    describe('#viewAnonymous()', function(){
        it('should search',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 100, [], users[0].token, function (err, itemId) {
                if (err) return done(err);
                Item.view(itemId, users[1].token, function (err, data) {
                    if (err) return done(err);
                    data.should.not.have.property('message');
                    done();
                })
            });
        });
    });

    describe('#viewAnonymousPrivate()', function(){
        it('shouldnt view',function (done) {
            Friend.addFriend(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 100, [users[0].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.view(itemId, users[1].token, function (err, data) {
                        if (!err) return done("Should return an error");
                        done();
                    })
                });
            });
        });
    });

    describe('#addComment()', function(){
        it('should add a comment',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test", "Test",1, null, 40.665006, -3.779096, 100, [], users[0].token, function (err, itemId) {
                if (err) return done(err);
                Item.addComment(itemId,"Hello comment", users[0].token, function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        });
    });


    describe('#listCollected()', function(){
        it('should search',function (done) {
           //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create(Item.TYPE_MESSAGE, "Title Test","Test",1, null, 40.665006, -3.779096, 100, [], users[0].token, function (err, itemId) {
                if (err) return done(err);
                Item.collect(itemId,40.665350,-3.778955,users[1].token,function(err) {
                    if (err) return done(err);
                    Item.listCollected( users[1].token, function (err, data) {
                        if (err) return done(err);
                        //console.log(data);
                        data.length.should.be.equal(1);
                        done();
                    });
                });
            });
        });
    });

    describe('#listInbox()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);
                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE,  "Title Test","Test",1, null, 40.665006, -3.779096, 50, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.listSentToMe(users[1].token, function (err,data) {
                        if (err) return done(err);
                        //console.log(data);
                        data.length.should.be.equal(1);
                        done();
                    });
                });
            });
        });
    });

    describe('#listSentByMe()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE,  "Title Test","Test",1, null, 40.665006, -3.779096, 50, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.listSentByMe(users[0].token, function (err,data) {
                        if (err) return done(err);
                        //console.log(data);
                        data.length.should.be.equal(1);
                        done();
                    });
                });
            });
        });
    });

    describe('#listSentByMeAndOpened()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(Item.TYPE_MESSAGE,  "Title Test","Test",1, null, 40.665006, -3.779096, 50, [users[1].id], users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.collect(itemId, 40.665006, -3.779096,users[1].token,function(err){
                        if (err) return done(err);
                        Item.listSentByMe(users[0].token, function (err,data) {
                            if (err) return done(err);
                            data.length.should.be.equal(1);
                            done();
                        })
                    });

                });
            });
        });
    });
});