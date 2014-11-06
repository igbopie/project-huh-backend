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
var nUsers = 3;
var users = null;
var templateId = null;
var mapIconId = null;
var mediaId = null;

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
                            Media.create("test/resources/testimage.jpg",users[0].token,function(err,mymediaId) {
                                if (err) return done(err);
                                mediaId = mymediaId;
                                Template.create("TestTemplate", 0, mediaId, users[0].token, function (err, rTemplateId) {
                                    if (err) return done(err);
                                    templateId = rTemplateId;
                                    MapIcon.create("TestIcon","tag",mediaId,null,0, users[0].token, function (err, rMapIconId) {
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
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);

                data.should.have.property("markId");
                data.should.have.property("markShortlink");
                data.should.have.property("itemShortlink");
                data.should.have.property("itemId");

                Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,null,data.markId,users[0].token,function(err,data) {
                    if (err) return done(err)

                    data.should.have.property("itemId");
                    data.should.have.property("itemShortlink");
                    data.should.have.property("markShortlink");

                    done();
                });
            });
		});
	});
    describe('#createPublicAndListFromUserProfile', function(){
        it('should create an item object',function (done) {
            Item.create("Test", templateId, mapIconId, null, 41.2, 41.2, 10, [], null, null, "Nacho's house", null, users[0].token, function (err, data) {
                if (err) return done(err);
                Item.create("Test", templateId, mapIconId, null, 41.2, 41.2, 10, [users[1].id], null, null, "Nacho's house", null, users[0].token, function (err, data) {
                    if (err) return done(err);
                    Mark.search(41.2, 41.2, 100, null, 41.2, 41.2, users[0].token, function (err, results) {
                        if (err) return done(err);
                        Mark.listUserPublic(users[0].username,users[1].token,function(err,data){
                            if (err) return done(err);
                            //console.log(data);
                            data.length.should.be.equal(1);
                            data[0].user._id.should.be.equal(users[0].id);

                            Item.listUserPublic(users[0].username,users[1].token,function(err,data){
                                if (err) return done(err);

                                data.length.should.be.equal(1);
                                data[0].user._id.should.be.equal(users[0].id);

                                done();


                            });
                        });

                    });
                });
            });
        });
    });
    describe('#createPublicAndSearchMark', function(){
        it('should create an item object',function (done) {
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,null,data.markId,users[0].token,function(err) {
                    if (err) return done(err);
                    Mark.search(41.2,41.2,100,null,41.2,41.2,users[0].token,function(err,results){
                        if (err) return done(err);

                        results.length.should.be.equal(1);
                        //Sould be trimmed
                        //console.log(console.log(require('util').inspect(results, true, 10)));
                        results[0].items.length.should.be.equal(1);
                        results[0].items[0].user.should.have.property("username");


                        done();
                    });
                });
            });
        });
    });

    describe('#createPrivateAndSearchMark', function(){
        it('should create an item object',function (done) {
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10, [users[1].id],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Mark.search(41.2,41.2,100,null,41.2,41.2,users[0].token,function(err,results){
                    if (err) return done(err);

                    results.length.should.be.equal(1);

                    Mark.search(41.2,41.2,100,null,41.2,41.2,users[1].token,function(err,results){
                        if (err) return done(err);

                        results.length.should.be.equal(1);

                        Mark.view( results[0]._id,41.2,41.2, users[1].token,function(err,mark) {
                            if (err) return done(err);
                            if(!mark) return done("mark should be filled")

                            mark.members.length.should.be.equal(2);
                            mark.members[0].should.have.property("username");

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#createMixedAndSearchMark', function(){
        it('should create an item object',function (done) {
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

    describe('#viewPublicMark', function(){
        it('should create an item object',function (done) {
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Mark.view(data.markId,41.2,41.2,users[0].token,function(err,data){
                    if(err) return done(err);

                    data.should.have.property("_id");
                    data.should.have.property("items");
                    data.items.length.should.be.equal(1);

                    data.should.have.property("itemCount");
                    data.should.have.property("memberCount");
                    data.should.have.property("favouriteCount");
                    data.should.have.property("locationName");
                    data.should.have.property("locationAddress");
                    data.should.have.property("distance");
                    data.should.have.property("updated");
                    data.should.have.property("shortlink");

                    //console.log(require('util').inspect(data, true, 10));

                    done();

                });
            });
        });
    });

    describe('#viewPrivateMark', function(){
        it('should create an item object',function (done) {
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[users[1].id],null,null,"Nacho's house",null,users[0].token,function(err,createResponse){
                if (err) return done(err);
                Mark.view(createResponse.markId,41.2,41.2,users[0].token,function(err,data){
                    if(err) return done(err);
                    Mark.view(createResponse.markId,41.2,41.2,users[1].token,function(err,data){
                        if(err) return done(err);
                        Mark.view(createResponse.markId,41.2,41.2,users[2].token,function(err,data){
                            if(err && data == 401) return done();
                            if(!err) return done("Should return unauthorized")
                            done(err);
                        });
                    });
                });
            });
        });
    });

    describe('#viewItemMark', function(){
        it('should create an item object',function (done) {
            Item.create("Test",templateId,mapIconId,null,41.2,41.2,10,[users[1].id],null,null,"Nacho's house",null,users[0].token,function(err,createResponse){
                if (err) return done(err);
                Item.view(createResponse.itemId,41.2,41.2,users[0].token,function(err,data){
                    if(err) return done(err);
                    Item.view(createResponse.itemId,41.2,41.2,users[1].token,function(err,data){
                        if(err) return done(err);
                        Item.view(createResponse.itemId,41.2,41.2,users[2].token,function(err,data){
                            if(err && data == 401) return done();
                            if(!err) return done("Should return unauthorized")
                            done(err);
                        });
                    });
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
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [],null,null,"Nacho's house",null, users[0].token, function (err, item) {
                if (err) return done(err);
                Item.addComment(item.itemId,"Hello comment", users[0].token, function (err) {
                    if (err) return done(err);
                    Item.listComments(item.itemId,users[0].token, function (err, comments) {
                        if (err) return done(err);
                        //console.log(item);
                        comments.length.should.be.equal(1);
                        done();
                    });

                });
            });
        });
    });

    describe('#listItems()', function(){
        it('should list Items',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create("Test1",templateId,mapIconId,null,41.2,41.2,10, [],null,null,"Nacho's house",null,users[0].token,function(err,data){
                if (err) return done(err);
                Item.create("Test2",templateId,null,null,null,null,null,[],null,null,null,data.markId,users[0].token,function(err){
                    if (err) return done(err);
                    Item.listItems(data.markId,41.2,41.2,users[0].token, function (err, items) {
                        if (err) return done(err);
                        //console.log(item);
                        items.length.should.be.equal(2);
                        items[0].user.should.have.property("username");


                        done();
                    });

                });
            });
        });
    });


    describe('#viewNotAllowed()', function(){
        it('shouldnt view',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create("Test",templateId,mapIconId,null,40.665006,-3.779096,10,[],null,null,"Nacho's house",null,users[0].token,function(err,item){
                if(err) return done(err);
                Item.view(item.itemId,40.665350,-3.778955,users[1].token,function(err,obj){
                    if(err) return done(err);
                    obj.should.not.have.property("message");
                    done();
                })
            });
        });
    });

    describe('#viewAllowed()', function(){
        it('should view',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create("Test",templateId,mapIconId,null,40.665006,-3.779096,50,[],null,null,"Nacho's house",null,users[0].token,function(err,item){
                if(err) return done(err);
                Item.view(item.itemId,40.665350,-3.778955,users[1].token,function(err,obj){
                    if(err) return done(err);
                    if(!obj) return done("It should return an object");

                    obj.should.have.property("message");
                    done();
                })
            });
        });
    });




    describe('#viewAnonymous()', function(){
        it('should search',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [],null,null,"Nacho's house",null, users[0].token, function (err, item) {
                if (err) return done(err);
                Item.view(item.itemId,40.665350,-3.778955, users[1].token, function (err, data) {
                    if (err) return done(err);
                    data.should.have.property('message');
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
                Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [users[0].id],null,null,"home",null, users[0].token, function (err, item) {
                    if (err) return done(err);
                    Item.view(item.itemId,40.665350,-3.778955, users[1].token, function (err, code) {
                        if (err && code == 401) return done();
                        done("Should return 401 error");
                    })
                });
            });
        });
    });


    describe('#addCommentUnAuth()', function(){
        it('should add a comment',function (done) {
            //LAT       LONG
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 100, [],null,null,"Home",null, users[0].token, function (err, item) {
                if (err) return done(err);
                Item.addComment(item.itemId,"Hello comment", users[1].token, function (err,code) {
                    if (err && code == 401) return done();
                    done("Should return 401 error");

                });
            });
        });
    });






    describe('#listSentToMe()', function(){
        it('should search',function (done) {
            Friend.addFriend(users[1].username,users[0].token,function(err) {
                if (err) return done(err);
                //LAT       LONG
                //40.665006, -3.779096
                //40.665350, -3.778955
                // 40 m
                Item.create("Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,"Home",null, users[0].token, function (err, itemId) {
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
                Item.create("Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],null,null,"Home",null, users[0].token, function (err, itemId) {
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




    describe('#favourite()', function(){
        it('should search',function (done) {
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item.itemId,users[0].token,function(err){
                    if (err) return done(err);

                    Item.view(item.itemId,40.665006, -3.779096,users[0].token,function(err,item){
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
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item.itemId,users[0].token,function(err){
                    if (err) return done(err);

                    Item.favourite(item.itemId,users[0].token,function(err) {
                        if (err) return done(err);
                        Item.view(item.itemId, 40.665006, -3.779096, users[0].token, function (err, item) {
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

                Item.favourite(item.itemId,users[0].token,function(err){
                    if (err) return done(err);

                    Item.unfavourite(item.itemId,users[0].token,function(err) {
                        if (err) return done(err);

                        Item.view(item.itemId, 40.665006, -3.779096, users[0].token, function (err, item) {
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


    //
    describe('#favouriteMark()', function(){
        it('should fav a Mark',function (done) {
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Mark.favourite(item.markId,users[0].token,function(err){
                    if (err) return done(err);

                    Mark.view(item.markId,40.665006, -3.779096,users[0].token,function(err,mark){
                        if (err) return done(err);

                        mark.should.have.property("favouriteCount");
                        mark.favouriteCount.should.be.equal(1);
                        mark.should.have.property("favourited");
                        mark.favourited.should.be.ok;

                        Mark.listFavourite(users[0].token,function(err,listFavs){
                            if (err) return done(err);

                            listFavs.length.should.be.equal(1);

                            done()
                        });

                    });;
                });

            });
        });
    });

    describe('#favouriteMarkTwice()', function(){
        it('should search',function (done) {
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Mark.favourite(item.markId,users[0].token,function(err){
                    if (err) return done(err);

                    Mark.favourite(item.markId,users[0].token,function(err) {
                        if (err) return done(err);
                        Mark.view(item.markId, 40.665006, -3.779096, users[0].token, function (err, item) {
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

    describe('#unfavouriteMark()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Mark.favourite(item.markId,users[0].token,function(err){
                    if (err) return done(err);

                    Mark.unfavourite(item.markId,users[0].token,function(err) {
                        if (err) return done(err);

                        Mark.view(item.markId, 40.665006, -3.779096, users[0].token, function (err, item) {
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

    describe('#favouriteMarkAndStream()', function(){
        it('should fav a Mark',function (done) {
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Mark.favourite(item.markId,users[0].token,function(err){
                    if (err) return done(err);

                    Item.favStream(users[0].token,function(err,items){
                        if (err) return done(err);

                        items.length.should.be.equal(1);
                        items[0].should.have.property("mark");
                        items[0].mark.should.have.property("name");
                        //console.log(items);
                        done()
                    });;
                });

            });
        });
    });

    describe('#favouritePrivateMarkAndStream()', function(){
        it('should fav a Mark',function (done) {
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [users[1].id],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Mark.favourite(item.markId,users[0].token,function(err){
                    if (err) return done(err);

                    Item.favStream(users[0].token,function(err,items){
                        if (err) return done(err);

                        items.length.should.be.equal(0);

                        done()
                    });;
                });

            });
        });
    });

    //

    describe('#favouriteAndList()', function(){
        it('should search',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            //40.665006, -3.779096
            //40.665350, -3.778955
            // 40 m
            Item.create( "Test",templateId,mapIconId, null, 40.665006, -3.779096, 50, [],"Calle badajo","Colegio Uno","Departamento de fisica",null, users[0].token, function (err, item) {
                if (err) return done(err);

                Item.favourite(item.itemId,users[0].token,function(err){
                    if (err) return done(err);

                    Item.listFavourite(users[0].token,function(err,results){
                        if (err) return done(err);
                        //console.log(results);
                        results.length.should.be.equal(1);

                        done()
                    });
                });

            });
        });
    });


    describe('#createWithImageTwoSteps()', function(){
        it('should create a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create( "I am here in starbucks",null,mapIconId, null, 41.2, 41.2, 10, [users[1].id],null,null,"Hola",null, users[0].token, function (err,item) {
                if (err) return done(err);
                Media.create("test/resources/testreal.jpeg",users[0].token,function(err,mediaId){
                    if(err) return done(err);
                    Item.addMedia(mediaId,item.itemId,users[0].token,function(err){
                        if(err) return done(err);
                        done()
                    });
                });
            });


        });
    });

    describe('#createWithImageTwoStepsAndFail()', function(){
        it('should create a media object',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Item.create( "I am here in starbucks",templateId,mapIconId, null, 41.2, 41.2, 10, [users[1].id],null,null,"Hola",null, users[0].token, function (err,mark) {
                if (err) return done(err);

                Item.create( "I am here in starbucks",null,null, null, null, null, null,[],null,null,null,mark.markId, users[0].token, function (err,twoStepsItem) {
                    if (err) return done(err);
                    Mark.search(41.2, 41.2,100,null,41.2, 41.2, users[0].token,function(err,data) {
                        if (err) return done(err);

                        data.length.should.be.equal(1);
                        data[0].itemCount.should.be.equal(1);

                        Media.create("test/resources/testreal.jpeg", users[0].token, function (err, mediaId) {
                            if (err) return done(err);
                            Item.addMedia(mediaId, twoStepsItem.itemId, users[0].token, function (err) {
                                if (err) return done(err);
                                Mark.search(41.2, 41.2, 100, null, 41.2, 41.2, users[0].token, function (err, data) {
                                    if (err) return done(err);

                                    data.length.should.be.equal(1);
                                    data[0].itemCount.should.be.equal(2);
                                    done()
                                });
                            });
                        });
                    });
                });
            });


        });
    });
});
