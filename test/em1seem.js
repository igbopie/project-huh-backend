var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var M1Seem = require('../apiclient/m1seem');
var media = null;
var seem = null;
var users = null;

describe('M1Seem', function(){

    beforeEach(function (done) {
        this.timeout(20000);//S3 requires longer timeout
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);
                    Media.create("test/resources/testimage.jpg",function(err,data){
                        if(err) return done(err);
                        media = data;
                        M1Seem.create("A title for a seam","A caption for the photo",data,users[0].token,function(err,data){
                            if (err) return done(err);
                            seem = data;
                            done();
                        });
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
            M1Seem.getItem(seem.itemId,function(err){
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
            var seemsArray = new Array();
            var itemsArray = new Array();
            var nSeems = 10;
            var nItems = 1000;
            var seemName= "Seem name ";
            var itemCaption= "Item caption ";

            auxCreateSeem(0,seemsArray,itemsArray,seemName,itemCaption,nSeems,function(err){
                if(err){
                    return done(err);
                }
                auxCreateItems(0,itemsArray,itemCaption,nItems,function(err){
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
    });

});

function auxCreateSeem(depth,seemsArray,itemsArray,seemName,itemCaption,nSeems,callback){
    M1Seem.create(seemName+depth,itemCaption+depth,media,users[0].token,function(err,data){
        if(err) return callback(err);
        seemsArray.push(data);
        itemsArray.push(data.itemId);
        if(depth < nSeems  ){
            auxCreateSeem(depth+1,seemsArray,itemsArray,seemName,itemCaption,nSeems,callback);
        }else{
            callback(null);
        }
    });
}

function auxCreateItems(depth,itemsArray,itemCaption,nItems,callback){


    var randomReplyIndex = Math.floor((Math.random()*itemsArray.length));
    var randomReplyId = itemsArray[randomReplyIndex];
    //console.log("RandomIndex:"+randomReplyIndex+" Size:"+itemsArray.length);

    M1Seem.reply(randomReplyId,itemCaption+depth,media,users[0].token,function(err,data){
        if(err) return callback(err);
        itemsArray.push(data._id);
        if(depth < nItems  ){
            auxCreateItems(depth+1,itemsArray,itemCaption,nItems,callback);
        }else{
            callback(null);
        }
    });
}
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
    M1Seem.getItem(parentItemId,function(err,parentItem){
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

