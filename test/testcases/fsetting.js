var assert = require("assert")
var TestUtils = require('../util/testutils');
var Setting = require('../apiclient/setting');
var should = require('should');
var nUsers = 5;
var users = null;

describe('Setting', function () {

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users, function (err) {
                if (err) return done(err);

                done();
            });
        });
    });


    describe('#list()', function () {
        it('should list', function (done) {
            Setting.list({token: users[1].token}, function (err, settings) {
                if (err) return done(err);
                var originalSetting = settings[0];

                Setting.update({token: users[1].token, name: originalSetting.name, value: false}, function (err) {
                    if (err) return done(err);

                    Setting.list({token: users[1].token}, function (err, settings) {
                        if (err) return done(err);

                        settings[0].value.should.not.be.equal(originalSetting.value);

                        done();
                    });
                });
            });
        })
    });


});



