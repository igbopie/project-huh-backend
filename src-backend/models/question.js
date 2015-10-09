'use strict';
var mongoose = require('mongoose'),
    UrlShortener = require('../utils/urlshortener'),
    Schema = mongoose.Schema,
    Utils = require('../utils/utils'),
    sanitizeHtml = require('sanitize-html'),
    LOCATION_LONGITUDE = 0,
    LOCATION_LATITUDE = 1,
    DATE_CONSTANT = new Date(2015, 1, 1, 0, 0, 0, 0).getTime(),
    LOCATION_RADIUS = 10 * 1000,
    Async = require('async'),
    _ = require('lodash'); // meters

var questionSchema = new Schema({
    typeId: {type: Schema.Types.ObjectId, required: true, ref: 'QuestionType'},
    text: {type: String, required: false},
    url: {type: String, required: false},
    username: {type: String, required: false},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    created: {type: Date, required: true, default: Date.now},
    updated: {type: Date, required: true, default: Date.now},
    deleted: {type: Date, required: false},
    location: {type: [Number], required: false, index: '2dsphere'},
    voteScore: {type: Number, required: true, default: 0},
    nVotes: {type: Number, required: true, default: 0},
    nUpVotes: {type: Number, required: true, default: 0},
    nDownVotes: {type: Number, required: true, default: 0},
    nComments: {type: Number, required: true, default: 0},
    activity: {type: Number, required: true, default: 0}, // nComments + nVotes
    createdScore: {type: Number, required: true, default: 0},
    trendingScore: {type: Number, required: true, default: 0}, // activity * (timeCreated - constant)
    popularScore: {type: Number, required: true, default: 0}, // voteScore * (timeCreated - constant)
    score: {type: Number, required: true, default: 0} // voteScore * (timeCreated - constant)
});

questionSchema.index({userId: 1});
questionSchema.index({created: -1});
questionSchema.index({deleted: -1});
questionSchema.index({voteScore: -1});
questionSchema.index({nComments: -1});
questionSchema.index({trendingScore: -1});
questionSchema.index({popularScore: -1});
questionSchema.index({score: -1});


var Question = mongoose.model('Question', questionSchema);

// Service?
var QuestionService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Service: QuestionService
};

var QuestionTypeService = require('./questionType').Service;
var QuestionVoteService = require('./questionVote').Service;
var QuestionNameService = require('./questionName').Service;
var NotificationService = require('./notification').Service;

var processQuestion = function (dbQuestion, userId, callback) {
    var process,
        processUserName,
        processShortLink;

    if (!dbQuestion) {
        return callback();
    }

    process = function () {
        var subProcess = function () {
            var question = {};
            question._id = dbQuestion._id;
            question.text = dbQuestion.text;
            question.type = dbQuestion.typeId;
            question.created = dbQuestion.created;
            question.updated = dbQuestion.updated;
            question.voteScore = dbQuestion.voteScore;
            question.nComments = dbQuestion.nComments;
            question.nVotes = dbQuestion.nVotes;
            question.nUpVotes = dbQuestion.nUpVotes;
            question.nDownVotes = dbQuestion.nDownVotes;
            question.username = dbQuestion.username;
            question.url = dbQuestion.url;

            if (userId) {
                QuestionVoteService.findVote(dbQuestion._id, userId, function (err, vote) {
                    if (err) {
                        console.error('Could not fetch my score');
                    }
                    if (vote) {
                        question.myVote = vote.score;
                    }
                    callback(undefined, question);
                });
            } else {
                callback(undefined, question);
            }
        };

        if (dbQuestion.typeId instanceof mongoose.Types.ObjectId) {
            Question.populate(
                dbQuestion,
                [
                    {path: 'typeId'}
                ],
                function (err) {
                    if (err) {
                        console.error('Could not populate typeId');
                    }

                    subProcess();
                }
            );
        } else {
            subProcess();
        }

    };

    processUserName = function () {
        if (!dbQuestion.username) {
            QuestionNameService.findOrCreate(dbQuestion._id, dbQuestion.userId, function (err, username) {
                if (err) {
                    return callback(err);
                }

                dbQuestion.username = username;

                dbQuestion.save(function (err) {
                    if (err) {
                        return callback(err);
                    }

                    processShortLink();
                });
            });
        } else {
            processShortLink();
        }
    };

    processShortLink = function () {
        if (!dbQuestion.url) {
            UrlShortener.shortenQuestion(dbQuestion._id, function (err, url) {
                if (err) { console.error(err); }

                dbQuestion.url = url;

                dbQuestion.save(function (err) {
                    if (err) {
                        return callback(err);
                    }

                    process();
                });
            });

        } else {
            process();
        }
    };

    processUserName();
};

var cleanInput = function (text, questionType) {
    text = text
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .replace(/\s+/g, ' ').trim();
    var pieces = text.split(' ');

    if (pieces.length === 0) {
        return '';
    }

    if (pieces[0].toLowerCase() === questionType.toLowerCase()) {
        pieces = pieces.splice(1);
    }
    var lastPiece = pieces[pieces.length-1];
    if (lastPiece.indexOf('?') === lastPiece.length - 1) {
        pieces[pieces.length-1] = lastPiece.substr(0, lastPiece.length-1);
    }
    return pieces.join(' ').trim();
};

QuestionService.create = function (type, text, latitude, longitude, userId, isAdmin, callback) {
    var question = new Question(),
        locationArray;
    question.type = type;
    question.userId = userId;
    question.created = Date.now();
    question.createdScore = Math.round((question.created.getTime() - DATE_CONSTANT) / 1000);
    question.text = cleanInput(text, type);

    if (question.text.length === 0) {
        return callback('cannot be empty');
    }

    if (question.text.length > 140) {
        return callback('too large');
    }

    if (latitude !== undefined &&
            latitude !== null &&
            longitude !== undefined &&
            longitude !== null) {
        locationArray = [];
        locationArray[LOCATION_LONGITUDE] = longitude;
        locationArray[LOCATION_LATITUDE] = latitude;
        question.location = locationArray;
    }

    // Validation
    QuestionTypeService.find(question.type, function (err, qType) {
        if (err) {
            return callback(err);
        }
        if (!qType) { return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND, 'Question Type not found')); }
        question.typeId = qType._id;
        question.save(function (err) {
            if (err) {
                return callback(err);
            }

            question.typeId = qType;
            QuestionNameService.findOrCreate(question._id, question.userId, function (err, username) {
                if (err) {
                    return callback(err);
                }

                if (isAdmin) {
                    question.username = 'Mummy';
                } else {
                    question.username = username;
                }
                UrlShortener.shortenQuestion(question._id, function (err, url) {
                    if (err) { console.error(err); }

                    question.url = url;
                    question.save(function (err) {
                        if (err) {
                            return callback(err);
                        }

                        processQuestion(question, userId, callback);

                        NotificationService.onQuestionCreated(question._id, qType);
                    });
                });

            });
        });
    });
};

var baseQuery = function (query) {
    return _.defaults(query,{ deleted: {$exists: false}});
};

var execQuery = function (query, sort, userId, page, numItems, callback) {
    Question.find(baseQuery(query),
        null,
        {
            limit: numItems,
            skip: numItems * page,
            sort: sort
        })
        .populate('typeId')
        .exec(function (err, questions) {
            if (err) {
                return callback(err);
            }

            Async.map(
                questions,
                function (dbQuestion, mapCallback) {
                    processQuestion(dbQuestion, userId, mapCallback);
                },
                callback
            );

        });
};

QuestionService.recent = function (userId, page, numItems, callback) {
    execQuery({}, {
        'created': -1
    }, userId, page, numItems, callback);
};

QuestionService.trending = function (userId, page, numItems, callback) {
    execQuery({}, {
        'score': -1
    }, userId, page, numItems, callback);
};

QuestionService.mine = function (userId, page, numItems, callback) {
    execQuery(
        {userId: userId},
        {
            'created': -1
        },
        userId,
        page,
        numItems,
        callback
    );
};

QuestionService.commented = function (userId, page, numItems, callback) {
    execQuery(
        {userId: userId},
        {
            'created': -1
        },
        userId,
        page,
        numItems,
        callback
    );
};

QuestionService.near = function (userId, latitude, longitude, page, numItems, callback) {
    var coordinates = [];
    coordinates[LOCATION_LATITUDE] = Number(latitude);
    coordinates[LOCATION_LONGITUDE] = Number(longitude);

    Question.aggregate(
        [
            {
                $geoNear: {
                    near: {type: 'Point', coordinates: coordinates},
                    distanceField: 'dist',
                    maxDistance: LOCATION_RADIUS,
                    query: {},
                    limit: 10000,
                    spherical: true
                }
            },
            {$sort: {created: -1}},
            {$skip: numItems * page},
            {$limit: numItems}
        ]
    )
        .exec(function (err, questions) {
            if (err) { return callback(err); }

            Async.map(
                questions,
                function (dbQuestion, mapCallback) {
                    processQuestion(dbQuestion, userId, mapCallback);
                },
                callback
            );
        });
};

QuestionService.processQuestionIds = function (questionIds, userId, callback) {
    execQuery(
        {_id: {$in: questionIds}},
        {
            'created': -1
        },
        userId,
        0,
        questionIds.length,
        callback
    );
};

var calcScores = function (question) {
    var voteScore = question.voteScore === 0 ? 1 : question.voteScore,
        activity = question.activity === 0 ? 1 : question.activity;
    question.popularScore = voteScore * question.createdScore;
    question.trendingScore = activity * question.createdScore;
    question.score = voteScore * activity * question.createdScore;
};

QuestionService.updateVoteScore = function (voteIncrement, score, newVote, questionId, userId, callback) {
    var conditions = {_id: questionId},
        update = {$inc: {voteScore: voteIncrement}},
        options = {multi: false, new: true};

    if (newVote) {
        update.$inc.nVotes = 1;
        update.$inc.activity = 1;

        if (score > 0) {
            update.$inc.nUpVotes = 1;
        } else {
            update.$inc.nDownVotes = 1;
        }
    } else {
        if (score > 0) {
            update.$inc.nUpVotes = 1;
            update.$inc.nDownVotes = -1;
        } else if (score < 0) {
            update.$inc.nUpVotes = -1;
            update.$inc.nDownVotes = 1;
        } else {
            // clear score
            update.$inc.nVotes = -1;

            if (voteIncrement > 0) {
                update.$inc.nDownVotes = -1;
            } else {
                update.$inc.nUpVotes = -1;
            }
        }
    }

    Question.findOneAndUpdate(conditions, update, options,
        function (err, question) {
            if (err) {
                return callback(err);
            }
            calcScores(question);
            question.save(function (err) {
                if (err) {
                    return callback(err);
                }

                processQuestion(question, userId, callback);
            });
        });
};

QuestionService.incCommentCount = function (questionId, callback) {
    var conditions = {_id: questionId},
        update = {$inc: {nComments: 1}},
        options = {multi: false, new: true};

    update.$inc.activity = 1;

    Question.findOneAndUpdate(conditions, update, options,
        function (err, question) {
            if (err) {
                return callback(err);
            }
            calcScores(question);
            question.save(callback(err));
        });
};

QuestionService.findById = function (questionId, callback) {
    Question.findOne(baseQuery({_id: questionId})).populate('typeId').exec(callback);
};

QuestionService.view = function (questionId, userId, callback) {
    Question.findOne(baseQuery({_id: questionId}), function (err, doc) {
        if (err) {
            return callback(err);
        }

        if (!doc) {
            return callback();
        }

        processQuestion(doc, userId, callback);
    });
};

QuestionService.delete = function (questionId, callback) {
    Question.findOne(baseQuery({_id: questionId}), function (err, doc) {
        if (err) {
            return callback(err);
        }

        if (!doc) {
            return callback();
        }

        doc.deleted = Date.now();
        doc.save(function (err) {
            if (err) {
                return callback(err);
            }
            NotificationService.onQuestionDeleted(doc._id);
            callback();
        });
    });
};

QuestionService.getTotal = function (callback) {
    Question.count(baseQuery(), function (err, count) {
        callback(err, count);
    });
};

