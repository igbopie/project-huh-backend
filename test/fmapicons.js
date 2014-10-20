var assert = require("assert");
var should = require('should');
var TestUtils = require('../utils/testutils');
var Media = require('../apiclient/media');
var User = require('../apiclient/user');
var Item = require('../apiclient/item');
var Friend = require('../apiclient/friend');
var Mark = require('../apiclient/mark');
var MapIcon = require('../apiclient/mapicon');
var nUsers = 3;
var users = null;
var mediaId = null;

describe('MapIcons', function(){

    beforeEach(function (done) {

        this.timeout(20000);//S3 requires longer timeout
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            TestUtils.cleanMapIcons(function(err){
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
    describe('#mapIconsSystem',function(){
        it('should create and verify mapicon system',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            MapIcon.create("TestTemplate", "tag", mediaId,null, users[0].token, function (err, rTemplateId) {
                if (err) return done(err);

                var date = Date.now();
                MapIcon.createPack("Pack",mediaId,users[0].token, function (err, groupId) {
                    if (err) return done(err);

                    MapIcon.create("TestTemplate2", "tag", mediaId,groupId, users[0].token, function (err, rTemplateId) {
                        if (err) return done(err);

                        MapIcon.list(date,users[0].token,function(err,list){
                            if (err) return done(err);

                            list.length.should.be.equal(1);

                            MapIcon.list(null,users[0].token,function(err,list) {
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


});
