var assert = require("assert")
var TestUtils = require('../util/testutils');
var User = require('../apiclient/user');
var Starbucks = require('../apiclient/starbucks');
var should = require('should');
var A_USERNAME = 'starbucks@huhapp.com';
var A_PASSWORD = 'thisSucks!123!';
var token;

// Workaround to access not exposed API calls
var UserService = require('../../dist/models/user').Service;

describe('Starbucks', function () {

    beforeEach(function (done) {
        this.timeout(5000);
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            UserService.createAdminWithEmailAndPassword(A_USERNAME, A_PASSWORD, function (err) {
                if (err) {
                    return done(err);
                }

                User.login({email: A_USERNAME, password: A_PASSWORD}, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        return done("User should exist");
                    }

                    token = user.token;

                    User.loginCheck({token: token}, function (err) {
                        if (err) {
                            return done(err);
                        }

                        TestUtils.populateDB(function () {
                            done();
                        });
                    });

                });
            });
        });
    });


    describe('#dashboardUnAuth()', function () {
        it('should unauth', function (done) {
            Starbucks.dashboard({}, function(err, code){
                if (code !== 401) {
                    return done(err);
                }

                done();
            });
        })
    });

    describe('#dashboard()', function () {
        it('should auth', function (done) {
            Starbucks.dashboard({token: token}, function(err, params){
                if (err) {
                    return done(err);
                }

                console.log(params);

                done();
            });
        })
    });

});



