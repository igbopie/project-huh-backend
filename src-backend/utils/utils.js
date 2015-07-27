'use strict';
var utils = {},
    mongoose = require('mongoose');

utils.randomString = function (length) {
    var text = '',
        possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        i;

    for (i = 0; i < length;  i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

utils.randomNumber = function (length) {
    var text = '',
        possible = '0123456789',
        i;

    for (i = 0; i < length; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

utils.extractTags = function (sentence) {
    var tags = sentence.match(/[#]+[A-Za-z0-9_]+/g), // .toLowerCase() case sensitive
        i,
        j;
    if (!tags) {
        return [];
    }
    // Remove repeated
    for (i = 0; i < tags.length; i += 1) {
        for (j = (i + 1); j < tags.length; j += 1) {
            if (tags[i].toLowerCase() === tags[j].toLowerCase()) {
                tags.splice(j, 1);
                j -= 1;
            }

        }

    }
    return tags;
};


utils.joinToUser = function (schema, userProp, userIdPropName, usernamePropName) {
    if (userProp === undefined) {
        userProp = 'user';
    }
    if (userIdPropName === undefined) {
        userIdPropName = 'userId';
    }
    if (usernamePropName === undefined) {
        usernamePropName = 'username';
    }
    schema.virtual(userIdPropName).get(function () {
        if (this[userProp] instanceof mongoose.Types.ObjectId) {
            return this[userProp];
        }
        if (this[userProp] !== undefined) {
            return this[userProp]._id;
        }
        return undefined;
    });
    schema.virtual(usernamePropName).get(function () {
        if (this[userProp] instanceof mongoose.Types.ObjectId) {
            return undefined;
        }
        if (this[userProp] !== undefined) {
            return this[userProp].username;
        }
        return undefined;
    });
    schema.set('toJSON', {getters: true, virtuals: true} );
    schema.set('toObject', {getters: true, virtuals: true} );
    schema.method('toJSON', function () {
        var me = this.toObject();
        if (this[userProp] instanceof mongoose.Types.ObjectId) {
            delete me[userProp];
        }
        return me;
    });
};

// ERROR HANDLING
var HuhError = function (code, message) {
    this.code = code;
    this.message = message;
};

utils.HuhError = HuhError;
utils.error = function (code, message) {
    return new HuhError(code, message);
};

utils.ERROR_CODE_UNAUTHORIZED = 400100;
utils.ERROR_CODE_NOTFOUND = 400101;
utils.ERROR_CODE_ALREADY_EXISTS = 400102;

// export the class
module.exports = utils;
