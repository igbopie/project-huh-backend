var assert = require("assert")
var TestUtils = require('../util/testutils');
var AuthUser = require('../apiclient/authUser');
var starbucks = require('../apiclient/starbucks');
var should = require('should');
var A_USERNAME = 'starbucks@huhapp.com';
var A_PASSWORD = 'thisSucks!123!';
var token;

describe('Starbucks', function () {

    beforeEach(function (done) {
        this.timeout(5000);
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);

            AuthUser.login({username: A_USERNAME, password: A_PASSWORD}, function (err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done("User should exist");
                }

                token = user.token;

                AuthUser.check({token: token}, function (err) {
                    if (err) {
                        return done(err);
                    }

                    TestUtils.populateDB(function(){
                        done();
                    });
                });

            });
        });
    });


    describe('#dashboardUnAuth()', function () {
        it('should unauth', function (done) {
            starbucks.dashboard({}, function(err, code){
                if (code !== 401) {
                    return done(err);
                }

                done();
            });
        })
    });

    describe('#dashboard()', function () {
        it('should auth', function (done) {
            starbucks.dashboard({token: token}, function(err, params){
                if (err) {
                    return done(err);
                }

                console.log(params);

                done();
            });
        })
    });

});



