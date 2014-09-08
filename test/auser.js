var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var nUsers = 5;

describe('User', function(){

    beforeEach(function (done) {
        TestUtils.cleanDatabase(done);
    });

    describe('#createSuperadmin()', function(){
        it('should create a user',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    TestUtils.makeSuperAdmin(users[0],function(err){
                        if (err) return done(err);

                        console.log(users[0]);
                        done();
                    })
                });
            });

        });
    });

    describe('#create()', function(){
        it('should create a user',function (done) {
	        User.create("igbopie@gmail.com","igbopie","123456",function(err){
                if (err) return done(err);

                done();

            });
	    });
    });

    describe('#create() - Username exists', function(){
        it('should create a user',function (done) {
            User.create("igbopie@gmail.com","igbopie","123456",function(err){
                if (err) return done(err);
                User.create("pepe@gmail.com","igbopie","123456",function(err,code){
                    should(code).be.eql(466);//username already exists
                    done();
                });
            });
        });
    });

    describe('#create() - Email exists', function(){
        it('should create a user',function (done) {
            User.create("igbopie@gmail.com","igbopie","123456",function(err){
                if (err) return done(err);
                User.create("igbopie@gmail.com","pepe","123456",function(err,code){
                    should(code).be.eql(467);//email already exists
                    done();
                });
            });
        });
    });

    describe('#login()', function(){
        it('should login '+nUsers+' users',function (done) {
            var users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    for(var i = 0; i < users.length;i++){
                        users[i].should.have.property('token');
                        users[i].should.be.ok;
                    }
                    done();
                });
            });
        });
    });

    describe('#extendtoken()', function(){
        it('should extend '+nUsers+' users',function (done) {
            var users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    var calledBack = 0;
                    for(var i = 0; i < users.length;i++){
                        User.extendToken(users[i].token,function(err){
                            calledBack++;
                            if(err){
                                done(err);
                            } else if(calledBack >= users.length){
                                done();
                            }
                        });
                    }
                });
            });
        });
    });



    describe('#updateDetails()', function(){
        it('should update user details',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    var newEmail = Utils.randomString(5)+"@"+Utils.randomString(5)+".com";
                    var facebookId = Utils.randomNumber(10);
                    var bio = Utils.randomString(5);
                    var name = Utils.randomString(5);
                    User.update(newEmail,facebookId,null,bio,name,users[0].token,function(err){
                        if (err) return done(err);
                        User.profile(users[0].username,users[0].token,function(err,data){
                            if (err) return done(err);
                            should(data.bio).be.eql(bio);
                            should(data.name).be.eql(name);
                            should(data.email.toLowerCase()).be.eql(newEmail.toLowerCase());
                            should(data.facebookId).be.eql(facebookId);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#update(profileImage)', function(){
        it('should update only the image profile',function (done) {
            this.timeout(20000);//S3 requires longer timeout
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    Media.create("test/resources/testimage.jpg",users[0].token,function(err,data){
                        if(err) return done(err);
                        User.update(null,null,data,null,null,users[0].token,function(err){
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#profile1()', function(){
        it('should get user details',function (done) {
            var users = TestUtils.randomUsers(2);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.profile(users[1].username,users[0].token,function(err,data){
                        if (err) return done(err);
                        should(data.username.toLowerCase()).be.eql(users[1].username.toLowerCase());
                        done();
                    });
                });
            });
        });
    });

    describe('#profile2()', function(){
        it('should get user details',function (done) {
            var users = TestUtils.randomUsers(2);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.profile(users[0].username,users[0].token,function(err,data){
                        if (err) return done(err);
                        should(data.email.toLowerCase()).be.eql(users[0].email.toLowerCase());
                        done();
                    });
                });
            });
        });
    });


    describe('#addPhone()', function(){
        it('should add a phone to 1 user',function (done) {

            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.addPhone("12345678",users[0].token,function(err){
                        if (err) return done(err);
                        done();
                    });
                });
            });
        });
    });

    describe('#verifyPhone()', function(){
        it('should add a phone and verify it',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.addPhone("12345678",users[0].token,function(err){
                        if (err) return done(err);
                        TestUtils.findDBUser(users[0].username,function(err,dbUser){
                            if (err) return done(err);
                            User.verifyPhone("12345678",dbUser.phoneVerificationCode,users[0].token,function(err,obj){
                                if (err) return done(err);
                                should(obj).be.ok;
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('#addApnToken()', function(){
        it('should add a apn token',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.addApnToken("<THIS IS A APN TOKEN>",users[0].token,function(err){
                        if (err) return done(err);
                        done();
                    });
                });
            });
        });
    });

    describe('#removeApnToken()', function(){
        it('should remove a apn token',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.addApnToken("<THIS IS A APN TOKEN>",users[0].token,function(err){
                        if (err) return done(err);
                        User.removeApnToken(users[0].token,function(err) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });
    });
    describe('#addCcmToken()', function(){
        it('should add a gcm token',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.addGcmToken("<THIS IS A GCM TOKEN>",users[0].token,function(err){
                        if (err) return done(err);
                        done();
                    });
                });
            });
        });
    });

    describe('#removeGcmToken()', function(){
        it('should remove a gcm token',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    User.addGcmToken("<THIS IS A GCM TOKEN>",users[0].token,function(err){
                        if (err) return done(err);
                        User.removeGcmToken(users[0].token,function(err) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });
    });
});