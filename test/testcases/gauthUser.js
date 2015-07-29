var assert = require("assert")
var TestUtils = require('../util/testutils');
var User = require('../apiclient/user');
var should = require('should');
var A_USERNAME = 'starbucks@huhapp.com';
var A_PASSWORD = 'thisSucks!123!';

// Workaround to access not exposed API calls
var UserService = require('../../dist/models/user').Service;

describe('AuthUser', function () {

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);

            done();
        });
    });


    describe('#auth()', function () {
        it('should auth', function (done) {
            UserService.createAdminWithEmailAndPassword(A_USERNAME, A_PASSWORD, function (err) {
                User.login({email: A_USERNAME, password: A_PASSWORD}, function (err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (!user) {
                        return done("User should exist");
                    }

                    user.should.have.property("token");

                    User.loginCheck({token: user.token}, function (err) {
                        if (err) {
                            return done(err);
                        }

                        done();
                    });

                });
            });

        })
    });

});



