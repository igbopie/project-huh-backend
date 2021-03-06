var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Flag = require('../apiclient/flag');
var nUsers = 5;
var users = null;

describe('Question', function () {

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


    describe('#create()', function () {
        it('should create a question', function (done) {
            Question.create(
                {
                    token: users[0].token,
                    type: "WHAT",
                    text: "time is it",
                    latitude: 0,
                    longitude: 0
                },
                function (err, question) {
                    if (err) return done(err);

                    Flag.flag({questionId: question._id, token: users[0].token, reason: "HATE"}, function (err) {
                        if (err) return done(err);

                        done();
                    });
                }
            );
        })
    });

    describe('#view()', function () {
        it('should view a question', function (done) {
            Question.create(
                {
                    token: users[0].token,
                    type: "WHAT",
                    text: "time is it",
                    latitude: 0,
                    longitude: 0
                },
                function (err, question) {
                    if (err) return done(err);

                    Question.view({questionId: question._id, token: users[0].token}, function (err, questionViewed) {
                        if (err) return done(err);
                        if (!questionViewed) return done("no question");

                        questionViewed._id.should.be.equal(question._id);

                        done();
                    });
                }
            );
        });
    });

    describe('#viewInexistent()', function () {
        it('shouldn\'t view a question', function (done) {
            Question.view({questionId: "55ab317f0e4aa9f838327792", token: users[0].token}, function (err, errCode) {
                if (errCode !== 470) return done("Code not equals to 470");

                done();
            });
        });
    });

    describe('#list()', function () {
        it('should list a question', function (done) {
            Question.create(
                {
                    token: users[0].token,
                    type: "WHAT",
                    text: "time is it",
                    latitude: 0,
                    longitude: 0
                },
                function (err) {
                    if (err) return done(err);

                    Question.recent({token: users[0].token}, function (err, docs) {
                        if (err) return done(err);

                        docs.length.should.be.equal(1);

                        Question.trending({token: users[0].token}, function (err, docs) {
                            if (err) return done(err);

                            docs.length.should.be.equal(1);

                            Question.near({
                                latitude: 0.01,
                                longitude: 0.01,
                                token: users[0].token
                            }, function (err, docs) {
                                if (err) return done(err);

                                docs.length.should.be.equal(1);

                                done();
                            });
                        });
                    });
                }
            );
        })
    });



    describe('#tooLarge()', function () {
        it('should not create question', function (done) {
            Question.create(
                {
                    token: users[0].token,
                    type: "WHAT",
                    text: "MAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMA" +
                    "ASDAMAASDAMAASDAMsdkalkdsjakljdlkjaljdslkajklsdjlkajskldjlkajdslkjsakljdklajlksAAl" +
                    "kasdjlajsdjlajsdkjajsdljaklsjdlkjaa,sdlakjlskdjlasdjlkajlksdjlkjaldsjlkjalksdjklaj" +
                    "slkdjlkajsdlkjalksjdkljalksdjkljakldsjlkajslkdjalsdakaljdlkjlkasjdkljalksdjklajsdkl" +
                    "jalksjdklajskldjalsdlsdadsSDA",
                    latitude: 0,
                    longitude: 0
                },
                function (err) {
                    if (err) return done();

                    done("Question was too large to create");
                }
            );
        });
    });


    describe('#shouldnotscapequotes()', function () {
        it('should not scape quotes', function (done) {
            var questionText = "\"quotes\"";
            Question.create(
                {
                    token: users[0].token,
                    type: "WHAT",
                    text: questionText,
                    latitude: 0,
                    longitude: 0
                },
                function (err, dbQuestion) {
                    if (err) return done(err);


                    dbQuestion.text.should.be.equal(questionText);

                    done();
                }
            );
        });
    });

    describe('#delete()', function () {
        it('should delete', function (done) {
            TestUtils.populateDB(function(err, db){
                if (err) return done(err);
                Question.delete({token: db.users[0].token, questionId: db.questions[0]._id}, function(err) {
                    if (!err) return done("It should not delete");
                    Question.delete({token: db.adminUser.token, questionId: db.questions[0]._id}, function (err) {
                        if (err) return done(err);

                        Question.view({
                            token: db.adminUser.token,
                            questionId: db.questions[0]._id
                        }, function (err, resp) {
                            if (err && resp !== 470) return done(err);
                            done();
                        })
                    });
                });
            });
        });
    });

});



