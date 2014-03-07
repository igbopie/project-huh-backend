var assert = require("assert")
var should = require('should')
var TestUtils = require('../utils/testutils');
var Utils = require('../utils/utils');
var User = require('../apiclient/user');
var Media = require('../apiclient/media');
var Seem = require('../apiclient/seem');
var nUsers = 2;
var users = null;

describe('Seem', function(){

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function(err){
            if(err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users,function(err){
                if(err) return done(err);
                TestUtils.loginUsers(users,function(err){
                    if(err) return done(err);
                    done();
                });
            });
        });
    });
    describe('#create()', function(){
        it('should create a seem',function (done) {
	        Seem.create("This is a new seem","public",users[0].token,function(err){
                if (err) return done(err);
                done();
            });
	    });
    });

    describe('#get()', function(){
        it('should get a seem',function (done) {
            Seem.create("This is a new seem","public",users[0].token,function(err,data){
                if (err) return done(err);
                console.log(data);
                Seem.get(data,users[0].token,function(err){
                    if (err) return done(err);
                    done();
                });
            });
        });
    });


});