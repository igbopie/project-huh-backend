'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    dateUtils = require('date-utils'),
    jwt = require('jsonwebtoken'),
    SALT_WORK_FACTOR = 10,
    SECRET = 'u6HS1T8YDehvBHMPou7T1P1Dqk5nS0jM',
    EXPIRES = 60;

// TODO http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose
var authUserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    created: {type: Date, required: true, default: Date.now },
    modified: {type: Date, required: true, default: Date.now },
    admin: Boolean
});

authUserSchema.index({apnToken: 1});

authUserSchema.pre('save', function (next) {
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

authUserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};


var AuthUser = mongoose.model('AuthUser', authUserSchema);

// Service
var AuthUserService = {};

AuthUserService.create = function (username, password, callback) {
    var user = new AuthUser();
    user.username = username;
    user.password = password;

    user.save(function (err) {
        callback(err, user._id);
    });
};

AuthUserService.auth = function (username, password, callback) {
    // fetch user and test password verification
    AuthUser.findOne({ username: username }, function (err, user) {
        if (err) {
            return callback(err);
        }

        if (!user) {
            return callback(undefined, undefined);
        }

        // test a matching password
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                return callback(err);
            }

            if (!isMatch) {
                return callback();
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
                    _id: user._id,
                    username: user.username,
                    token: token
                }
            );

        });
    });
};

AuthUserService.isAuth = function (token, callback) {
    jwt.verify(token, SECRET, callback);
};

module.exports = {
    Service: AuthUserService
};

// Check there is at least one
var A_USERNAME = 'starbucks@huhapp.com';
var A_PASSWORD = 'thisSucks!123!';
AuthUser.findOne({username: A_USERNAME}, function (err, user) {
    if (err) {
        return console.error('Could not check if user was created');
    }
    if (user) {
        return console.log('Basic Auth User exists');
    }

    AuthUserService.create(A_USERNAME, A_PASSWORD, function (err) {
        if (err) {
            return console.error('Could not create Basic Auth User');
        }
        return console.log('Basic Auth User Created');
    });

});
