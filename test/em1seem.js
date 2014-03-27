var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var M1Seem = require('../apiclient/m1seem');
var media = null;
var seem = null;

describe('M1Seem', function(){

    beforeEach(function (done) {

        this.timeout(20000);//S3 requires longer timeout
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            Media.create("test/resources/testimage.jpg",function(err,data){
                if(err) return done(err);
                media = data;
                M1Seem.create("A title for a seam","A caption for the photo",data,function(err,data){
                    if (err) return done(err);
                    seem = data;
                    done();
                });
            });
        });
    });

    describe('#create()', function(){
        it('should create a seem',function (done) {
            M1Seem.create("A title for a seam","A caption for the photo",media,function(err,data){
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
            M1Seem.reply(seem.itemId,"This is a reply",media,function(err,reply){
                if (err) return done(err);

                should(reply.depth).be.equal(1);

                done();
            });
        });
    });

    describe('#replyRecursive()', function(){
        it('should reply',function (done) {
            M1Seem.reply(seem.itemId,"This is a reply",media,function(err,reply){
                if (err) return done(err);
                M1Seem.reply(reply._id,"This is another reply",media,function(err,reply2) {
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
            M1Seem.reply(seem.itemId,"This is a reply",media,function(err){
                if (err) return done(err);
                M1Seem.getItemReplies(seem.itemId,0,function(err,data){
                    if (err) return done(err);

                    should(data.length).be.equal(1);

                    done();
                });
            });

        });
    });


});