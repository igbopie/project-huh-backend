var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var M1Seem = require('../apiclient/seem');
var media = "5343ce700ceeccdd20189502";//fake
var seem = null;
var users = null;

describe('Seem', function(){

    beforeEach(function (done) {
        this.timeout(20000);//S3 requires longer timeout
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(2);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);

                    M1Seem.create("A title for a seam", "A caption for the photo", media, users[0].token, function (err, data) {
                        if (err) return done(err);
                        seem = data;
                        done();
                    });
                });
            });
        });
    });

    describe('#create()', function(){
        it('should create a seem',function (done) {
            M1Seem.create("A title for a seam","A caption for the photo",media,users[0].token,function(err,data){
                if (err) return done(err);
                done();
            });
	    });
    });

    describe('#list()', function(){
        it('should list seems',function (done) {
            M1Seem.list(function(err,data){
                if (err) return done(err);
                should(data.length).be.equal(1);
                should(data[0]._id).be.equal(seem._id);
                done();
            });
        });
    });

    describe('#getItem()', function(){
        it('should get the first item',function (done) {
            M1Seem.getItem(seem.itemId,null,function(err){
                if (err) return done(err);

                done();
            });
        });
    });

    describe('#reply()', function(){
        it('should reply',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);

                should(reply.depth).be.equal(1);

                done();
            });
        });
    });

    describe('#replyRecursive()', function(){
        it('should reply',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,users[0].token,function(err,reply2) {
                    if (err) return done(err);

                    should(reply2.replyTo).be.equal(reply._id);
                    should(reply2.depth).be.equal(2);
                    should(reply2.seemId).be.equal(seem._id);

                    done();
                });
            });
        });
    });

    describe('#getItemReplies()', function(){
        it('should reply',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.getItemReplies(seem.itemId,0,function(err,data){
                    if (err) return done(err);

                    should(data.length).be.equal(1);

                    done();
                });
            });

        });
    });
    describe('#randomSeemAndReplies()', function(){
        it('should be consistent',function (done) {

            this.timeout(20000);
            var nSeems = 10;
            var nItems = 100;
            TestUtils.createSeemsAndItems(nSeems,nItems,users,function(err,seemsArray,itemsArray){
                if(err){
                    return done(err);
                }
                //console.log("Done no errors ");
                var seemRetCount = 0;
                seemsArray.forEach(function(seem){
                    var parentItemId = seem.itemId;
                    var stats={seemCount:0,seemDepth:0}
                    countAux(parentItemId,seem,0,stats,function() {
                        //TODO seem test count but there is no API seem count
                        /*
                        if (seem.itemCount != stats.seemCount) {
                            console.log("WARNING Seem " + seem.title + " ParentItem:" + parentItemId +
                                " Depth:" + stats.seemDepth + " Seem count:" + seem.itemCount + " calculated:" + stats.seemCount);
                        }

                        should(seem.itemCount).be.equal(stats.seemCount);
                        */
                        seemRetCount++;
                        if(seemRetCount > nSeems){
                            console.log("Finished");
                            done();
                        }
                    });
                });

            });

        });
    });

    describe('#favourite()', function(){
        it('should favourite',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,users[0].token,function(err,reply2) {
                    if (err) return done(err);
                    M1Seem.favourite(reply._id,users[0].token,function(err){
                        if (err) return done(err);
                        M1Seem.getItem(reply._id,null,function(err,reply){
                            if(err) return done(err);

                            reply.favouriteCount.should.be.equal(1);

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#favouriteTwice()', function(){
        it('should favourite once',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,users[0].token,function(err,reply2) {
                    if (err) return done(err);
                    M1Seem.favourite(reply._id,users[0].token,function(err){
                        if (err) return done(err);
                        M1Seem.favourite(reply._id,users[0].token,function(err){
                            //Ignore this error
                            M1Seem.getItem(reply._id,null,function(err,reply){
                                if(err) return done(err);

                                reply.favouriteCount.should.be.equal(1);

                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('#unfavourite()', function(){
        it('should unfavourite',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,users[0].token,function(err,reply2) {
                    if (err) return done(err);
                    M1Seem.favourite(reply._id,users[0].token,function(err){
                        if (err) return done(err);
                        M1Seem.unfavourite(reply._id,users[0].token,function(err){
                            if (err) return done(err);
                            M1Seem.getItem(reply._id,null,function(err,reply) {
                                if (err) return done(err);

                                reply.favouriteCount.should.be.equal(0);

                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('#unfavouriteTwice()', function(){
        it('should unfavourite once',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,users[0].token,function(err,reply2) {
                    if (err) return done(err);
                    M1Seem.favourite(reply._id,users[0].token,function(err){
                        if (err) return done(err);
                        M1Seem.unfavourite(reply._id,users[0].token,function(err){
                            if (err) return done(err);
                            M1Seem.unfavourite(reply._id,users[0].token,function(err) {
                                //Ignore the error
                                M1Seem.getItem(reply._id,null, function (err, reply) {
                                    if (err) return done(err);

                                    reply.favouriteCount.should.be.equal(0);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('#favouriteAndGetItem()', function(){
        it('should favourite',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,users[0].token,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,users[0].token,function(err,reply2) {
                    if (err) return done(err);
                    M1Seem.favourite(reply._id,users[0].token,function(err){
                        if (err) return done(err);
                        M1Seem.getItem(reply._id,users[0].token,function(err,reply){
                            if(err) return done(err);

                            reply.favouriteCount.should.be.equal(1);
                            reply.favourited.should.be.ok;
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#thumbUp()', function(){
        it('should thumb up',function (done) {
            M1Seem.thumbUp(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.getItem(seem.itemId,users[0].token,function(err,reply){
                    if(err) return done(err);

                    reply.thumbUpCount.should.be.equal(1);
                    reply.thumbDownCount.should.be.equal(0);
                    reply.thumbScoreCount.should.be.equal(1);

                    reply.thumbedUp.should.be.ok;
                    reply.thumbedDown.should.be.not.ok;
                    done();
                });
            });
        });
    });

    describe('#thumbDown()', function(){
        it('should thumb down',function (done) {
            M1Seem.thumbDown(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.getItem(seem.itemId,users[0].token,function(err,reply){
                    if(err) return done(err);

                    reply.thumbUpCount.should.be.equal(0);
                    reply.thumbDownCount.should.be.equal(1);
                    reply.thumbScoreCount.should.be.equal(-1);


                    reply.thumbedUp.should.be.not.ok;
                    reply.thumbedDown.should.be.ok;
                    done();
                });
            });
        });
    });

    describe('#thumbUpAndClear()', function(){
        it('should thumb up and clear',function (done) {
            M1Seem.thumbUp(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbClear(seem.itemId,users[0].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(0);
                        reply.thumbDownCount.should.be.equal(0);
                        reply.thumbScoreCount.should.be.equal(0);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbDownAndClear()', function(){
        it('should thumb up and clear',function (done) {
            M1Seem.thumbDown(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbClear(seem.itemId,users[0].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(0);
                        reply.thumbDownCount.should.be.equal(0);
                        reply.thumbScoreCount.should.be.equal(0);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbUpAndDown()', function(){
        it('should thumb up and down',function (done) {
            M1Seem.thumbUp(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbDown(seem.itemId,users[0].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(0);
                        reply.thumbDownCount.should.be.equal(1);
                        reply.thumbScoreCount.should.be.equal(-1);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbUpAndDown()', function(){
        it('should thumb down and up',function (done) {
            M1Seem.thumbDown(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbUp(seem.itemId,users[0].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(1);
                        reply.thumbDownCount.should.be.equal(0);
                        reply.thumbScoreCount.should.be.equal(1);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbUpTwice()', function(){
        it('should thumb up and up',function (done) {
            M1Seem.thumbUp(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbUp(seem.itemId,users[0].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(1);
                        reply.thumbDownCount.should.be.equal(0);
                        reply.thumbScoreCount.should.be.equal(1);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbDownTwice()', function(){
        it('should thumb up and up',function (done) {
            M1Seem.thumbDown(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbDown(seem.itemId,users[0].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(0);
                        reply.thumbDownCount.should.be.equal(1);
                        reply.thumbScoreCount.should.be.equal(-1);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbUpTwiceTwoUsers()', function(){
        it('should thumb up and up',function (done) {
            M1Seem.thumbUp(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbUp(seem.itemId,users[1].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(2);
                        reply.thumbDownCount.should.be.equal(0);
                        reply.thumbScoreCount.should.be.equal(2);
                        done();
                    });
                });
            });
        });
    });

    describe('#thumbUpAndDownTwoUsers()', function(){
        it('should thumb up and down',function (done) {
            M1Seem.thumbUp(seem.itemId,users[0].token,function(err){
                if (err) return done(err);
                M1Seem.thumbDown(seem.itemId,users[1].token,function(err) {
                    if (err) return done(err);
                    M1Seem.getItem(seem.itemId, users[0].token, function (err, reply) {
                        if (err) return done(err);

                        reply.thumbUpCount.should.be.equal(1);
                        reply.thumbDownCount.should.be.equal(1);
                        reply.thumbScoreCount.should.be.equal(0);
                        done();
                    });
                });
            });
        });
    });

    describe('#listTopics()', function(){
        it('should list topics',function (done) {
            M1Seem.listTopics(function(err,topics){
                if (err) return done(err);

                topics.length.should.be.above(0);

                done();
            });
        });
    });

    describe('#createSeemWithATopic()', function(){
        it('should create a seem with a topic',function (done) {
            M1Seem.listTopics(function(err,topics){
                if (err) return done(err);

                M1Seem.createWithTopic("A title for a seam","A caption for the photo",media,topics[0]._id,users[0].token,function(err,seem){
                    if (err) return done(err);

                    seem.should.have.property('topicId');

                    done();
                });
            });

        });
    });

    describe("#topicList()",function(){
        it('should list a seem in a topic',function (done) {
            M1Seem.listTopics(function(err,topics){
                if (err) return done(err);

                M1Seem.createWithTopic("A title for a seam","A caption for the photo",media,topics[0]._id,users[0].token,function(err,seem){
                    if (err) return done(err);
                    M1Seem.findByTopic(topics[0]._id,0,function(err,list){
                        if (err) return done(err);

                        list.length.should.be.equal(1);
                        list[0]._id.should.be.equal(seem._id);

                        done();
                    });

                });
            });

        });
    })
    describe("#hotness()",function(){
        it('should list seems by hotness (incomplete)',function (done) {

            this.timeout(20000);
            var nSeems = 10;
            var nItems = 100;
            TestUtils.createSeemsAndItems(nSeems,nItems,users,function(err,seemsArray,itemsArray){
                if (err) return done(err);
                M1Seem.findByHotness(0,function(err,seems){
                    if (err) return done(err);

                    seems.length.should.be.above(0);

                    done();
                });
            });
        });
    })

    describe("#viral()",function(){
        it('should list seems by viral (incomplete)',function (done) {

            this.timeout(20000);
            var nSeems = 10;
            var nItems = 100;
            TestUtils.createSeemsAndItems(nSeems,nItems,users,function(err,seemsArray,itemsArray){
                if (err) return done(err);
                M1Seem.findByViral(0,function(err,seems){
                    if (err) return done(err);

                    seems.length.should.be.above(0);

                    done();
                });
            });
        });
    })

    describe("#recent()",function(){
        it('should list seems by viral (incomplete)',function (done) {

            this.timeout(20000);
            var nSeems = 10;
            var nItems = 100;
            TestUtils.createSeemsAndItems(nSeems,nItems,users,function(err,seemsArray,itemsArray){
                if (err) return done(err);
                M1Seem.findByCreated(0,function(err,seems){
                    if (err) return done(err);

                    seems.length.should.be.above(0);

                    done();
                });
            });
        });
    })


    describe("#hashtags1()",function(){
        it("should extract hashtags",function(done){
            var tags = Utils.extractTags("#hola #facil");

            should(tags).containEql("#hola");
            should(tags).containEql("#facil");

            done();

        });
    })

    describe("#hashtags2()",function(){
        it("should extract hashtags",function(done){
            var tags = Utils.extractTags("A sentence with things ¿#hola?Si!¡No#facil--dd");
            should(tags).containEql("#hola");
            should(tags).containEql("#facil");
            done();

        });
    })

    describe("#hashtags3()",function(){
        it("should extract hashtags",function(done){
            var tags = Utils.extractTags("#rep Repeated tags #rep #nacho");
            should(tags).containEql("#rep");
            should(tags).containEql("#nacho");
            should(tags.length).be.equal(2);
            done();

        });
    })

    describe("#hashtags4()",function(){
        it("should extract hashtags",function(done){
            var tags = Utils.extractTags("underscore tags #_D");
            should(tags).containEql("#_D");
            done();

        });
    })

    describe("#hashtags5()",function(){
        it("should extract hashtags",function(done){
            var tags = Utils.extractTags("case insensitive #Tags #tags #tAgs");
            should(tags.length).be.equal(1);
            done();

        });
    })

    describe("#createASeemWithAHashtag()",function(){
        it("should create a seem with a Hashtag",function(done){

            M1Seem.create("A title for a #seem", "A #caption for the photo of a #seem", media, users[0].token, function (err, data) {
                if (err) return done(err);
                should(data.tags).containEql("#seem");
                should(data.tags).containEql("#caption");

                should(data.tags.length).be.equal(2);
                done();
            });

        });
    })


});


function getAllRepliesAux(parentItemId,page,replies,callback){

    M1Seem.getItemReplies(parentItemId,page,function(err,data){
        //console.log("getItemReplies:"+parentItemId+"Lenght:"+data.length);
        if(data != null && data.length > 0 ){
            getAllRepliesAux(parentItemId,page+1,replies.concat(data),callback);
        }else{
            callback(replies);
        }
    })
}
function countAux(parentItemId,seem,count,stats,callback){
    M1Seem.getItem(parentItemId,null,function(err,parentItem){
        parentItem.depth = count;
        parentItem.seemId = seem._id;
        if(!stats.lastUpdate || stats.lastUpdate < parentItem.created){
            stats.lastUpdate = parentItem.created;
        }
        count++;
        stats.seemCount++;

        var replyCount = 0;
        var recCount = 0;
        //fetch collection
        getAllRepliesAux(parentItemId,0,new Array(),function(replies) {
            //console.log("getAllRepliesAux."+replies.length);
            for(var i = 0;i < replies.length;i++){
                var item = replies[i];
                countAux(item._id, seem, count, stats, function () {
                    recCount--;
                    if (recCount == 0) {
                        //console.log("Finished subtree");
                        callback();
                    }
                });
                replyCount++;
                recCount++;
            }
            if (parentItem.replyCount != replyCount) {
                console.log("WARNING Item:" + parentItem._id + "(Seem:" + seem.title + ") Count:" + parentItem.replyCount + " Calculated:" + replyCount);
            }
            should(parentItem.replyCount).be.equal(replyCount);
            if (replyCount == 0) {
                if (count > stats.seemDepth) {
                    stats.seemDepth = count;
                }
                callback();
            }
        });
    });
}

