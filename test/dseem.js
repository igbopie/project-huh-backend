var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var Seem = require('../apiclient/seem');
var media = "5343ce700ceeccdd20189502";//fake
var seem = null;
var users = null;
var dateUtils = require('date-utils');

describe('Seem', function() {

    beforeEach(function (done) {
        this.timeout(20000);//S3 requires longer timeout
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            users = TestUtils.randomUsers(2);
            TestUtils.createUsers(users, function (err) {
                if (err) return done(err);
                TestUtils.loginUsers(users, function (err) {
                    if (err) return done(err);

                    TestUtils.createFakeMedia(media, function (err) {
                        if (err) return done(err);
                        var expire = new Date();
                        expire.addDays(1);

                        Seem.create("A title for a seam", expire, users[0].token, function (err, data) {
                            if (err) return done(err);
                            seem = data;
                            done();
                        });
                    });
                });
            });
        });
    });


    describe('#addWithExif', function () {
        it('should get a media object', function (done) {
            this.timeout(20000);//S3 requires longer timeout
            Media.create("test/resources/exifimage.jpg", function (err, mediaId) {
                Seem.addToSeem(seem.id, mediaId, "A caption for the photo", users[0].token, function (err, data) {
                    if (err) return done(err);
                    data.should.have.properties('exifLocation');
                    done();
                });
            });
        });
    });

    describe('#addToExpiredSeem', function () {
        it('shouldnt allow to do it', function (done) {
            var expire = new Date();
            expire.addDays(-1);

            Seem.create("Expired seem", expire, users[0].token, function (err, seem) {
                if (err) return done(err);
                Seem.addToSeem(seem.id, media, "A caption for the photo", users[0].token, function (err,code) {
                    if (err && code == 472){
                        done();
                    } else if (err){
                        done(err);
                    } else{
                        done("Should return an error");
                    }

                });
            });

        });
    });
    describe('#getSeemItems', function () {
        it('should get seem post', function (done) {
            Seem.addToSeem(seem.id, media, "A caption for the photo", users[0].token, function (err) {
                if (err) return done(err);
                Seem.getSeemItems(seem.id,0, users[0].token, function (err,data) {
                    data.length.should.be.equal(1);
                    done();
                })

            });
        });
    });

    describe('#seemsAboutToExpire', function () {
        it('should get seems about to expire', function (done) {
             Seem.findByExpire(0, function (err,data) {
                    data.length.should.be.equal(1);
                    done();
                });
        });
    });

    describe('#seemsExpired', function () {
        it('should get seems about to expire', function (done) {
            var expire = new Date();
            expire.addDays(-1);

            Seem.create("A title for a seam", expire, users[0].token, function (err, data) {
                Seem.findByExpired(0, function (err,data) {
                    data.length.should.be.equal(1);
                    done();
                });
            });
        });
    });

});