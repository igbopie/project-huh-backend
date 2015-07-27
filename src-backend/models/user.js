'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Utils = Require('../utils/utils'),
    dateUtils = require('date-utils'),
    Async = require('async'),
    LOCATION_LONGITUDE = 0,
    LOCATION_LATITUDE = 1;


var userSchema = new Schema({
    created: {type: Date, required: true, default: Date.now},
    modified: {type: Date, required: true, default: Date.now},
    apnToken: {type: String, required: false}, // iOs notification
    apnSubscribeDate: {type: Date, required: false},
    gcmToken: {type: String, required: false}, // Android notification
    gcmSubscribeDate: {type: Date, required: false},
    location: {type: [Number], required: false, index: '2dsphere'}
});

userSchema.index({apnToken: 1});

var User = mongoose.model('User', userSchema);

// Service
var service = {};

service.create = function (callback) {
    var user = new User();
    user.save(function (err) {
        callback(err, user._id);
    });
};

service.findById = function (id, callback) {
    User.findOne({_id: id}, callback);
};

service.findAll = function (callback) {
    User.find({}, callback);
};

service.addApnToken = function (apnToken, userId, callback) {
    service.unsubscribeApn(apnToken, Date.now(), true, function (err) {
        if (err) {
            return callback(err);
        }

        User.findById(userId, function (err, user) {
            if (err) {
                return callback(err);
            }
            if (!user) {
                return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND));
            }
            user.apnToken = apnToken;
            user.apnSubscribeDate = Date.now();
            user.save(function (err) {
                if (err) {
                    return callback(err);
                }

                callback();
            });
        });
    });
};

service.removeApnToken = function (userId, callback) {
    User.findById(userId, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND));
        }

        user.apnToken = undefined;
        user.apnSubscribeDate = undefined;
        user.save(function (err) {
            if (err) {
                return callback(err);
            }

            callback();
        });
    });
};

service.addGcmToken = function (gcmToken, userId, callback) {
    User.findById(userId, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND));
        }

        user.gcmToken = gcmToken;
        user.gcmSubscribeDate = Date.now();
        user.save(function (err) {
            if (err) {
                return callback(err);
            }

            callback();
        });
    });
};

service.removeGcmToken = function (userId, callback) {
    User.findById(userId, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND));
        }

        user.gcmToken = undefined;
        user.gcmSubscribeDate = undefined;
        user.save(function (err) {
            if (err) {
                return callback(err);
            }

            callback();
        });
    });
};

service.unsubscribeApn = function (apnToken, ts, force, callback) {
    User.where('apnToken').equals(apnToken)
        .exec(function (err, users) {
            if (err) {
                callback(err);
            } else {
                Async.each(users, function (user, next) {
                    console.log('Unsubscribing user:' + user);

                    // this device hasn't pinged our api since it unsubscribed
                    if (user.apnSubscribeDate <= ts || force) {
                        user.apnToken = null;
                        user.apnSubscribeDate = null;
                        user.save(next);
                    } else {
                        // we have seen this device recently so we don't need to deactive it
                        next();
                    }
                }, callback);
            }
        });
};

service.updateLocation = function (userId, latitude, longitude, callback) {
    service.findById(userId, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND));
        }
        if (latitude !== undefined &&
                latitude !== null &&
                longitude !== undefined &&
                longitude !== null) {
            var locationArray = [];
            locationArray[LOCATION_LONGITUDE] = longitude;
            locationArray[LOCATION_LATITUDE] = latitude;
            user.location = locationArray;
        }
        user.save(callback);
    });
};


service.getTotal = function (callback) {
    User.count({}, function (err, count) {
        callback(err, count);
    });
};


module.exports = {
    Service: service
};
