var assert = require("assert");
var should = require('should');
var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var User = require('../apiclient/user');
var Item = require('../apiclient/item');
var Friend = require('../apiclient/friend');
var Mark = require('../apiclient/mark');
var Template = require('../apiclient/template');
var MapIcon = require('../apiclient/mapicon');
var nUsers = 2;
var users = null;
var templateId = null;
var mapIconId = null;


describe('Item', function(){

    beforeEach(function (done) {

        this.timeout(20000);//S3 requires longer timeout
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);
                    if(!templateId){
                        TestUtils.makeSuperAdmin(users[0],function(err){
                            if(err) return done(err);
                            Media.create("test/resources/testimage.jpg",users[0].token,function(err,mediaId) {
                                if (err) return done(err);
                                Template.create("TestTemplate", 0, mediaId, users[0].token, function (err, rTemplateId) {
                                    if (err) return done(err);
                                    templateId = rTemplateId;
                                    MapIcon.create("TestIcon","tag",mediaId, users[0].token, function (err, rMapIconId) {
                                        if (err) return done(err);
                                        mapIconId = rMapIconId;
                                        done();
                                    })
                                });
                            });
                        });

                    }else{
                        done();
                    }
                });
            });
        });
    });

    describe('#createPublic', function(){
        it('should create an item object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,null,data.markId,users[0].token,function(err) {
                    if (err) return done(err);
                    done();
                });
            });
		});
	});

    describe('#createPublicAndSearchMark', function(){
        it('should create an item object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,null,data.markId,users[0].token,function(err) {
                    if (err) return done(err);
                    Mark.search(41.2,41.2,100,null,41.2,41.2,users[0].token,function(err,results){
                        if (err) return done(err);

                        results.length.should.be.equal(1);

                        done();
                    });
                });
            });
        });
    });

    describe('#createPrivateAndSearchMark', function(){
        it('should create an item object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10, [users[1].id],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Mark.search(41.2,41.2,100,null,41.2,41.2,users[0].token,function(err,results){
                    if (err) return done(err);

                    results.length.should.be.equal(1);

                    Mark.search(41.2,41.2,100,null,41.2,41.2,users[1].token,function(err,results){
                        if (err) return done(err);

                        results.length.should.be.equal(1);

                        done();
                    });
                });
            });
        });
    });

    describe('#createMixedAndSearchMark', function(){
        it('should create an item object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create("Test1",templateId,mapIconId,null,41.2,41.2,10, [],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Item.create("Test2",templateId,mapIconId,null,41.2,41.2,10, [users[1].id],null,null,"Nacho's house",null,users[0].token,function(err,data){
                    if (err) return done(err);
                    Mark.search(41.2,41.2,100,null,41.2,41.2,users[0].token,function(err,results){
                        if (err) return done(err);

                        results.length.should.be.equal(2);
                        //console.log(require('util').inspect(results, true, 10));

                        done();
                    });
                });
            });
        });
    });


    describe('#createWithImage()', function(){
        it('should create a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Media.create("test/resources/testreal.jpeg",users[0].token,function(err,mediaId){
                if(err) return done(err);
                Item.create("Test2",null,mapIconId,mediaId,41.2,41.2,10, [],null,null,"Nacho's house",null,users[0].token,function(err,data){
                    if (err) return done(err);
                    done();
                });
            });

        });
    });

    describe('#addComment()', function(){
        it('should add a comment',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [],null,null,"Nacho's house",null, users[0].token, function (err, item) {
                if (err) return done(err);
                Item.addComment(item._id,"Hello comment", users[0].token, function (err) {
                    if (err) return done(err);
                    Item.listComments(item._id,users[0].token, function (err, comments) {
                        if (err) return done(err);
                        //console.log(item);
                        comments.length.should.be.equal(1);
                        done();
                    });

                });
            });
        });
    });

    /*

    describe('#viewNotAllowed()', function(){
        it('shouldnt view',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create("Test",templateId,mapIconId,null,40.665006,-3.779096,10,[],null,null,null,null,users[0].token,function(err,item){
                if(err) return done(err);
                Item.view(item._id,40.665350,-3.778955,users[1].token,function(err,obj){
                    if(err) return done(err);
                    obj.should.not.have.property("message");
                    done();
                })
            });
        });
    });

    describe('#viewAllowed()', function(){
        it('should view',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create("Test",templateId,mapIconId,null,40.665006,-3.779096,50,[],null,null,null,null,users[0].token,function(err,item){
                if(err) return done(err);
                Item.view(item._id,40.665350,-3.778955,users[1].token,function(err,obj){
                    if(err) return done(err);
                    if(!obj) return done("It should return an object");
                    done();
                })
            });
        });
    });



    describe('#searchInboxByLocationInRange()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,null,null, users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Item.searchByLocationUserLocation(40.665350, -3.778955, 41,40.665350, -3.778955, users[1].token, function (err,data) {
                        if (err) return done(err);
                        data.sentToMe.length.should.be.equal(1);
                        data.sentToMe[0].canView.should.be.ok;
                        done();
                    })
                });
            });
        });
    });

    describe('#searchByLocationNotMyInbox()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create(  "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,null,null, users[0].token, function (err, itemId) {
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
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].id,users[0].token,function(err) {
                if (err) return done(err);
                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,null,null, users[0].token, function (err, itemId) {
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



    describe('#viewAnonymous()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [],null,null,null,null, users[0].token, function (err, item) {
                if (err) return done(err);
                Item.view(item._id,40.665350,-3.778955, users[1].token, function (err, data) {
                    if (err) return done(err);
                    data.should.have.property('message');
                    done();
                })
            });
        });
    });

    describe('#viewAnonymousPrivate()', function(){
        it('shouldnt view',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].id,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [users[0].id],null,null,null,null, users[0].token, function (err, item) {
                    if (err) return done(err);
                    Item.view(item._id,40.665350,-3.778955, users[1].token, function (err, data) {
                        if (err) return done(err);

                        data.should.not.have.property('message');

                        done();
                    })
                });
            });
        });
    });



    describe('#addCommentUnAuth()', function(){
        it('should add a comment',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [],null,null,null,null, users[0].token, function (err, item) {
                if (err) return done(err);
                Item.addComment(item._id,"Hello comment", users[1].token, function (err,code) {
                    if (err && code == 401) return done();
                    done("Should return 401 error");

                });
            });
        });
    });





    describe('#listInbox()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);
                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create("Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,null,null, users[0].token, function (err, itemId) {
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
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create("Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,null,null, users[0].token, function (err, itemId) {
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
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,null,null, users[0].token, function (err, itemId) {
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

    describe('#createAlias()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],"Calle badajo","Ete mi casa",null,null, users[0].token, function (err, itemId) {
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

    describe('#createAliasAndSearch()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Alias.search(  40.665006,-3.779096, 2000,null, users[0].token, function(err,results){

                        if (err) return done(err);
                        results.length.should.be.equal(1);
                        done();
                    } )

                });
            });
        });
    });

    describe('#createAliasAndSearchName()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Alias.search( null,null,null,"fisica", users[0].token, function(err,results){
                        if (err) return done(err);
                        results.length.should.be.equal(1);
                        done();
                    } )

                });
            });
        });
    });

    describe('#createAliasAndSearchFull()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);

                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, itemId) {
                    if (err) return done(err);
                    Alias.search( 40.665006,-3.779096, 2000,"fisica", users[0].token, function(err,results){
                        if (err) return done(err);
                        results.length.should.be.equal(1);
                        done();
                    } )

                });
            });
        });
    });

    describe('#favourite()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item._id,users[0].token,function(err){
                    if (err) return done(err);

                    Item.view(item._id,40.665006, -3.779096,users[0].token,function(err,item){
                        if (err) return done(err);

                        item.should.have.property("favouriteCount");
                        item.favouriteCount.should.be.equal(1);
                        item.should.have.property("favourited");
                        item.favourited.should.be.ok;

                        done()
                    });;
                });

            });
        });
    });

    describe('#favouriteTwice()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item._id,users[0].token,function(err){
                    if (err) return done(err);

                    Item.favourite(item._id,users[0].token,function(err) {
                        if (err) return done(err);
                        Item.view(item._id, 40.665006, -3.779096, users[0].token, function (err, item) {
                            if (err) return done(err);

                            item.should.have.property("favouriteCount");
                            item.favouriteCount.should.be.equal(1);
                            item.should.have.property("favourited");
                            item.favourited.should.be.ok;

                            done()
                        });
                    });

                });

            });
        });
    });

    describe('#unfavourite()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item._id,users[0].token,function(err){
                    if (err) return done(err);

                    Item.unfavourite(item._id,users[0].token,function(err) {
                        if (err) return done(err);

                        Item.view(item._id, 40.665006, -3.779096, users[0].token, function (err, item) {
                            if (err) return done(err);

                            item.should.have.property("favouriteCount");
                            item.favouriteCount.should.be.equal(0);
                            item.should.have.property("favourited");
                            item.favourited.should.be.not.ok;

                            done()
                        });
                    });
                });

            });
        });
    });

    describe('#favouriteAndList()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item._id,users[0].token,function(err){
                    if (err) return done(err);

                    Item.listFavourite(users[0].token,function(err,results){
                        if (err) return done(err);
                        //console.log(results);
                        results.length.should.be.equal(1);

                        done()
                    });;
                });

            });
        });
    });


    describe('#createWithImageTwoSteps()', function(){
        it('should create a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create( "I am here in starbucks",null,mapIconId, null, 41.2, 41.2, 10, [users[1].id],null,null,null,null, users[0].token, function (err,item) {
                if (err) return done(err);
                Media.create("test/resources/testreal.jpeg",users[0].token,function(err,mediaId){
                    if(err) return done(err);
                    Item.addMedia(mediaId,item._id,users[0].token,function(err){
                        if(err) return done(err);
                        done()
                    });
                });
            });


        });
    });*/
});
