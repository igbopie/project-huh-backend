'use strict';
var mongoose = require('mongoose'),
    u = require('underscore'),
    Schema = mongoose.Schema;


var flagSchema = new Schema({
    questionId: {type: Schema.Types.ObjectId, required: true, ref: 'Question'},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'userId'},
    reason: {type: String, required: true},
    created: {type: Date, required: true, default: Date.now}
});


var Flag = mongoose.model('Flag', flagSchema);

// Service?
var FlagService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Service: FlagService
};

FlagService.create = function (questionId, userId, reason, callback) {
    var flag = new Flag();
    flag.questionId = questionId;
    flag.userId = userId;
    flag.reason = reason;
    flag.created = Date.now();

    flag.save(function (err) {
        if (err) { return callback(err); }

        callback(null);
    });
};

FlagService.list = function (callback) {
    Flag.find({})
        .sort({created: -1})
        .exec(function (err, results) {
            if (err) { return callback(err); }

            callback(undefined, results);
        }
    );
};




