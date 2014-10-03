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
var mediaId = null;

describe('Template', function(){

    beforeEach(function (done) {

        this.timeout(20000);//S3 requires longer timeout
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            TestUtils.cleanTemplates(function(err){
                if(err) return done(err);

                users = TestUtils.randomUsers(nUsers);
                TestUtils.createUsers(users,function(err){
                    if(err) return done(err);
                    TestUtils.loginUsers(users,function(err){
                        if(err) return done(err);
                        TestUtils.makeSuperAdmin(users[0],function(err){
                            if(err) return done(err);
                            if(!mediaId){
                                Media.create("test/resources/testimage.jpg",users[0].token,function(err,mymediaId) {
                                    if (err) return done(err);
                                    mediaId = mymediaId;
                                    done();
                                });
                            }else{
                                done();
                            }
                        });
                    });
                });
            });
        });
    });
    describe('#templateSystem',function(){
        it('should create and verify template system',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Template.create("TestTemplate", 0, mediaId, users[0].token, function (err, rTemplateId) {
                if (err) return done(err);

                var date = Date.now();

                Template.create("TestTemplate2", 0, mediaId, users[0].token, function (err, rTemplateId) {
                    if (err) return done(err);

                    Template.list(date,users[0].token,function(err,list){
                        if (err) return done(err);

                        list.length.should.be.equal(1);

                        Template.list(null,users[0].token,function(err,list) {
                            if (err) return done(err);

                            list.length.should.be.equal(2);
                            done();
                        });
                    });
                });

            });
        });
    });


});
