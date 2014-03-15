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

    describe('#update()', function(){
        it('should update user details',function (done) {
            var users = TestUtils.randomUsers(1);
            TestUtils.createUsers(users,function(err){
                if (err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if (err) return done(err);
                    var newEmail = Utils.randomString(5)+"@"+Utils.randomString(5)+".com";
                    var facebookId = Utils.randomNumber(10);
                    User.update(newEmail,facebookId,null,users[0].token,function(err){
                        if (err) return done(err);
                        done();
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
                    Media.create("test/resources/testimage.jpg",function(err,data){
                        if(err) return done(err);
                        User.update(null,null,data,users[0].token,function(err){
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
                        should(data.username).be.eql(users[1].username);
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
                        should(data.email).be.eql(users[0].email);
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
});