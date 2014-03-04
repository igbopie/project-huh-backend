var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var User = require('../apiclient/user');
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