var assert = require("assert")
var TestUtils = require('../util/testutils');
var AuthUser = require('../apiclient/authUser');
var should = require('should');
var A_USERNAME = 'starbucks@huhapp.com';
var A_PASSWORD = 'thisSucks!123!';

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
            AuthUser.login({username: A_USERNAME, password: A_PASSWORD}, function (err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done("User should exist");
                }

                user.should.have.property("token");

                AuthUser.check({token: user.token}, function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });

            });
        })
    });

});



