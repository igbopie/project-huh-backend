'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Utils = require('../utils/utils'),
    dateUtils = require('date-utils'),
    Async = require('async'),
    generatePassword = require('password-generator'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    LOCATION_LONGITUDE = 0,
    LOCATION_LATITUDE = 1,
    SALT_WORK_FACTOR = 10,
    SECRET = 'u6HS1T8YDehvBHMPou7T1P1Dqk5nS0jM',
    EXPIRES = 60 * 24;


var userSchema = new Schema({
    created: {type: Date, required: true, default: Date.now},
    modified: {type: Date, required: true, default: Date.now},
    apnToken: {type: String, required: false}, // iOs notification
    apnSubscribeDate: {type: Date, required: false},
    gcmToken: {type: String, required: false}, // Android notification
    gcmSubscribeDate: {type: Date, required: false},
    location: {type: [Number], required: false, index: '2dsphere'},

    username: { type: String, required: false, index: { unique: true, sparse: true } },
    email: { type: String, required: false, index: { unique: true, sparse: true } },
    password: { type: String, required: true },
    admin: {type: Boolean, required: true, default: false }
});

userSchema.index({apnToken: 1});


userSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) {
            return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};


var User = mongoose.model('User', userSchema);

// Service
var UserService = {};

UserService.create = function (callback) {
    var user = new User(),
        cleanPassword = generatePassword(12, false); // once you save is hashed
    user.password = cleanPassword;
    user.save(function (err) {
        if (err) {
            return callback(err);
        }
        user.username = user._id;
        user.save(function (err) {
            callback(err, {username: user.username, password: cleanPassword});
        });
    });
};

UserService.createAdminWithEmailAndPassword = function (email, password, callback) {
    var user = new User();
    user.email = email;
    user.password = password;
    user.admin = true;
    user.save(function (err) {
        callback(err, {userId: user._id});
    });
};

UserService.findById = function (id, callback) {
    User.findOne({_id: id}, callback);
};

UserService.findAll = function (callback) {
    User.find({}, callback);
};

UserService.addApnToken = function (apnToken, userId, callback) {
    UserService.unsubscribeApn(apnToken, Date.now(), true, function (err) {
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

UserService.removeApnToken = function (userId, callback) {
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

UserService.addGcmToken = function (gcmToken, userId, callback) {
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

UserService.removeGcmToken = function (userId, callback) {
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

UserService.unsubscribeApn = function (apnToken, ts, force, callback) {
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

UserService.updateLocation = function (userId, latitude, longitude, callback) {
    UserService.findById(userId, function (err, user) {
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


UserService.getTotal = function (callback) {
    User.count({}, function (err, count) {
        callback(err, count);
    });
};


var _auth = function (user, password, callback) {
    if (!user) {
        return callback(Utils.error(Utils.ERROR_CODE_UNAUTHORIZED), undefined);
    }

    // test a matching password
    user.comparePassword(password, function (err, isMatch) {
        if (err) {
            return callback(err);
        }

        if (!isMatch) {
            return callback(Utils.error(Utils.ERROR_CODE_UNAUTHORIZED));
        }

        // if user is found and password is right
        // create a token
        var token = jwt.sign(
            user,
            SECRET,
            {
                expiresInMinutes: EXPIRES
            }
        );

        callback(
            undefined,
            {
                username: user.username,
                admin: user.admin,
                token: token
            }
        );

    });
};

UserService.auth = function (username, password, callback) {
    // fetch user and test password verification
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            return callback(err);
        }
        _auth(user, password, callback);
    });
};

UserService.authEmail = function (email, password, callback) {
    // fetch user and test password verification
    User.findOne({ email: email }, function (err, user) {
        if (err) {
            return callback(err);
        }
        _auth(user, password, callback);
    });
};

UserService.isAuth = function (token, callback) {
    jwt.verify(token, SECRET, callback);
};

module.exports = {
    Service: UserService
};

// Check there is at least one
var A_USERNAME = 'starbucks@huhapp.com';
var A_PASSWORD = 'thisSucks!123!';
User.findOne({email: A_USERNAME}, function (err, user) {
    if (err) {
        return console.error('Could not check if user was created');
    }
    if (user) {
        return console.log('Basic Auth User exists');
    }

    UserService.createAdminWithEmailAndPassword(A_USERNAME, A_PASSWORD, function (err) {
        if (err) {
            return console.error('Could not create Basic Auth User');
        }
        return console.log('Basic Auth User Created');
    });

});
