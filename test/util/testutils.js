var mongoose = require('mongoose'),
    User = require('../apiclient/user'),
    Question = require('../apiclient/question'),
    Comment = require('../apiclient/comment'),
    Flag = require('../apiclient/flag'),
    _ = require("lodash"),
    Async = require("async");


exports.cleanDatabase = function (callback) {
    var db = mongoose.createConnection();
    //Resest DB
    db.open('mongodb://localhost/huh', function (err) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        db.collection('users').remove(function (err) {
            if (err) {
                console.log(err);
                callback(err);
                return;
            }
            db.collection('questions').remove(function (err) {
                if (err) {
                    console.log(err);
                    callback(err);
                    return;
                }
                db.collection('comments').remove(function (err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                        return;
                    }

                    db.collection('questionvotes').remove(function (err) {
                        if (err) {
                            console.log(err);
                            callback(err);
                            return;
                        }
                        db.collection('commentvotes').remove(function (err) {
                            if (err) {
                                console.log(err);
                                callback(err);
                                return;
                            }
                            db.collection('notifications').remove(function (err) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                    return;
                                }
                                callback();
                            });
                        });
                    });
                });
            });
        });
    });
}

exports.createFakeMedia = function (id, callback) {
    var db = mongoose.createConnection();
    //Resest DB
    db.open('mongodb://localhost/seem', function (err) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        var media = {"_id": new mongoose.Types.ObjectId(id), test: 1};
        db.collection('media').save(media, function (err) {
            if (err) {
                callback(err);
            }
            //console.log(media);
            db.close(function (err) {
                callback(err);
            });
        });
    });
}
exports.findDBUser = function (username, callback) {
    var db = mongoose.createConnection();
    //Resest DB
    db.open('mongodb://localhost/seem', function (err) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        db.collection('users').findOne({username: username.toLowerCase()}, function (err, user) {
            if (err) {
                callback(err);
            } else {
                db.close(function (err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                        return;
                    }
                    callback(null, user);
                });
            }

        });
    });
}


exports.loginUsers = function (array, callback) {
    var i = 0;
    loginUsersAux(array, i, callback);
}

function loginUsersAux(array, i, callback) {
    if (i < array.length) {
        var user = array[i];
        User.login(user.username, user.password, function (err, object) {

            if (err) return callback(err);

            //console.log(object);
            user.err = err;
            user.token = object.token;
            user.username = object.username;

            i++;
            loginUsersAux(array, i, callback)
        });
    } else {
        callback();
    }

}
exports.makeSuperAdmin = function (user, callback) {
    var db = mongoose.createConnection();
    db.open('mongodb://localhost/seem', function (err) {
        if (err) return callback(err);
        db.collection('users').update({_id: mongoose.Types.ObjectId(user.id)}, {$set: {superadmin: true}}, function (err) {
            if (err) {
                callback(err);
            } else {
                db.close(function (err) {
                    if (err) {
                        console.log(err);
                        callback(err);
                        return;
                    }
                    callback(null);
                });
            }

        });
    });
}

exports.createUsers = function (array, callback) {
    var i = 0;
    createUsersAux(array, i, callback);
};

function createUsersAux(array, i, callback) {
    if (i < array.length) {
        var user = array[i];
        User.create(function (err, apiUser) {
            user.username = apiUser.username;
            user.password = apiUser.password;
            user.err = err;
            if (err) {
                console.log(err);
                return callback(err);
            }
            User.login({username: user.username, password: user.password}, function (err, loggedUser) {
                user.err = err;
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                user.token = loggedUser.token;
                i++;
                createUsersAux(array, i, callback);
            });
        });
    } else {
        callback();
    }

};

exports.randomUsers = function (nRandomUsers) {
    var array = new Array();
    for (var i = 0; i < nRandomUsers; i++) {
        array.push(randomUser());
    }
    return array;
};


function randomUser() {
    //var username = Utils.randomString(6);
    //var password = Utils.randomString(8);
    //var email = Utils.randomString(5) + "@" + Utils.randomString(5) + ".com";
    //return {email: email, username: username, password: password};
    return {};
}

exports.randomQuestions = function (user, nRandomQuestions) {
    var array = new Array();
    var questionTemplate = {
        token: user.token,
        type: "WHAT",
        text: "time is it",
        latitude: 0,
        longitude: 0
    };
    for (var i = 0; i < nRandomQuestions; i++) {
        array.push(_.clone(questionTemplate));
    }
    return array;
};

exports.createQuestions = function (array, callback) {
    var i = 0;
    createQuestionsAux(array, i, callback);
};

function createQuestionsAux(array, i, callback) {
    if (i < array.length) {
        var question = array[i];
        Question.create(question, function (err, backendQuestion) {
            _.defaults(question, backendQuestion);
            question.err = err;
            if (err) {
                console.log(err);
            }
            Flag.flag({questionId: question._id, token: question.token, reason: "HATE"}, function (err) {
                if (err) {
                    console.log(err);
                }

                i += 1;
                createQuestionsAux(array, i, callback)
            });
        });
    } else {
        callback();
    }
};

exports.randomComments = function (users, question, nRandomComments) {
    var array = new Array();
    var commentTemplate = {
        text: "Comment here",
        questionId: question._id,
        token: users[_.random(0, users.length-1)].token,
        longitude: 0.2,
        latitude: 0.1
    };
    for (var i = 0; i < nRandomComments; i++) {
        array.push(_.clone(commentTemplate));
    }
    return array;
};

exports.createComments = function (array, callback) {
    var i = 0;
    createCommentsAux(array, i, callback);
};

function createCommentsAux(array, i, callback) {
    if (i < array.length) {
        var comment = array[i];
        Comment.create(comment, function (err, backendComment) {
            _.defaults(comment, backendComment);
            comment.err = err;
            if (err) {
                console.log(err);
            }
            i += 1;
            createCommentsAux(array, i, callback)
        });
    } else {
        callback();
    }
};

exports.populateDB = function(callback) {
    var users = exports.randomUsers(3);
    exports.createUsers(users, function (err) {
        Async.each(
            users,
            function(user, callback){
                var questions = exports.randomQuestions(user, 3);
                exports.createQuestions(questions, function (err) {
                    Async.each(
                        questions,
                        function(question, callback) {
                            var comments = exports.randomComments(users, question, 3);
                            exports.createComments(comments, function (err) {
                                callback();
                            });
                        },
                        function(){
                            callback();
                        }
                    );
                });
            },
            function() {
                callback();
            }
        );

    });
};
