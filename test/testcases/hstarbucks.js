var assert = require("assert")
var TestUtils = require('../util/testutils');
var User = require('../apiclient/user');
var Starbucks = require('../apiclient/starbucks');
var should = require('should');
var token;

describe('Starbucks', function () {

    beforeEach(function (done) {
        this.timeout(5000);
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);

            TestUtils.populateDB(function (err, db) {
                token = db.adminUser.token;
                done();
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



