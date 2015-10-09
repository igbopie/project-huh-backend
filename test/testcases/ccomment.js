var assert = require("assert")
var TestUtils = require('../util/testutils');
var Question = require('../apiclient/question');
var Comment = require('../apiclient/comment');
var nUsers = 5;
var users = null;
var question = {
    type: "WHAT",
    text: "time is it",
    latitude: 0,
    longitude: 0
};

describe('Comment', function () {

    beforeEach(function (done) {
        //Clean and create some test users
        TestUtils.cleanDatabase(function (err) {
            if (err) return done(err);
            users = TestUtils.randomUsers(nUsers);
            TestUtils.createUsers(users, function (err) {
                if (err) return done(err);

                question.token = users[0].token;
                Question.create(
                    question
                    ,
                    function (err, data) {
                        if (err) return done(err);

                        question._id = data._id;
                        done();
                    }
                );
            });
        });
    });


    describe('#create()', function () {
        it('should create a comment', function (done) {
            var comment = {
                text: "hello",
                questionId: question._id,
                token: users[0].token,
                longitude: 0.2,
                latitude: 0.1
            };
            Comment.create(comment, function (err) {
                done(err);
            });
        })
    });


    describe('#list()', function () {
        it('should list all comment', function (done) {
            var comment1 = {
                text: "hello1",
                questionId: question._id,
                token: users[0].token
            };
            var comment2 = {
                text: "hello2",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err) {
                Comment.create(comment2, function (err) {
                    Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                        if (err) return done(err);

                        comments.length.should.be.equal(2);

                        Question.commented({token: users[0].token}, function (err, questions) {
                            //console.log(questions);
                            done(err);
                        })

                    });
                });
            });
        })
    });

    describe('#trim()', function () {
        it('should list all comment', function (done) {
            var comment1 = {
                text: "       hello1     ",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err) {
                Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                    if (err) return done(err);

                    comments[0].text.should.be.equal("hello1");

                    done();
                });
            });
        })
    });

    describe('#validation()', function () {
        it('should remove extra stuff', function (done) {
            var comment1 = {
                text: "       hello    <tag>my</tag> \t \t world ",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err) {
                Comment.list({questionId: question._id, token: users[0].token}, function (err, comments) {
                    if (err) return done(err);

                    //Scaping should happend in UI
                    comments[0].text.should.be.equal("hello <tag>my</tag> world");

                    done();
                });
            });

        });
    });

    describe('#tooLarge()', function () {
        it('should not create comment', function (done) {
            var comment1 = {
                text: "MAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMAASDAMA" +
                "ASDAMAASDAMAASDAMsdkalkdsjakljdlkjaljdslkajklsdjlkajskldjlkajdslkjsakljdklajlksAAl" +
                "kasdjlajsdjlajsdkjajsdljaklsjdlkjaa,sdlakjlskdjlasdjlkajlksdjlkjaldsjlkjalksdjklaj" +
                "slkdjlkajsdlkjalksjdkljalksdjkljakldsjlkajslkdjalsdakaljdlkjlkasjdkljalksdjklajsdkl" +
                "jalksjdklajskldjalsdlsdadsSDA",
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err) {
                if (err) return done();

                done("Comment was too large to create");
            });
        });
    });

    describe('#shouldnotscapequotes()', function () {
        it('should not scape quotes', function (done) {
            var commentText = "\"quotes\"";
            var comment1 = {
                text: commentText,
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err, commentDb) {
                if (err) return done(err);

                commentDb.text.should.be.equal(commentText);

                done();
            });
        });
    });


    describe('#flagcomment()', function () {
        it('should flag comment', function (done) {
            var commentText = "\"quotes\"";
            var comment1 = {
                text: commentText,
                questionId: question._id,
                token: users[0].token
            };
            Comment.create(comment1, function (err, commentDb) {
                if (err) return done(err);
                Comment.flag({commentId: commentDb._id, reason: "hateful", token: users[0].token}, function (err) {
                    if (err) return done(err);

                    done();
                });
            });
        });
    });

    describe('#delete()', function () {
        it('should delete', function (done) {
            TestUtils.populateDB(function(err, db){
                if (err) return done(err);
                Comment.delete({token: db.users[0].token, commentId: db.comments[0]._id}, function(err) {
                    if (!err) return done("It should not delete");
                    Comment.delete({token: db.adminUser.token, commentId: db.comments[0]._id}, function (err) {
                        if (err) return done(err);

                        Comment.view({
                            token: db.adminUser.token,
                            commentId: db.comments[0]._id
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



