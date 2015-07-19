'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    NOTIFICATION_TYPES = require('./notification').NOTIFICATION_TYPES,
    NOTIFICATIONS = [
        {
            name: NOTIFICATION_TYPES.ON_QUESTION_POSTED,
            defaultValue: false,
            title: 'New Question',
            description: 'Send me a notification when a new question is posted.'
        },
        {
            name: NOTIFICATION_TYPES.ON_COMMENT_ON_MY_QUESTION,
            defaultValue: true,
            title: 'Comment on my Question',
            description: 'Send me a notification when someone comments on my question.'
        },
        {
            name: NOTIFICATION_TYPES.ON_COMMENT_ON_MY_COMMENT,
            defaultValue: true,
            title: 'Comment on my Comment',
            description: 'Send me a notification when someone comments on a question I\'m participating in.'
        },
        {
            name: NOTIFICATION_TYPES.ON_UP_VOTE_ON_MY_QUESTION,
            defaultValue: true,
            title: '+1 My Question',
            description: 'My Question was up voted.'
        },
        {
            name: NOTIFICATION_TYPES.ON_DOWN_VOTE_ON_MY_QUESTION,
            defaultValue: true,
            title: '-1 My Question',
            description: 'My Question was down voted.'
        },
        {
            name: NOTIFICATION_TYPES.ON_UP_VOTE_ON_MY_COMMENT,
            defaultValue: true,
            title: '+1 My Comment',
            description: 'My Comment was up voted.'
        },
        {
            name: NOTIFICATION_TYPES.ON_DOWN_VOTE_ON_MY_COMMENT,
            defaultValue: true,
            title: '-1 My Comment',
            description: 'My Comment was up down voted.'
        }
    ];


var settingsSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    created: {type: Date, required: true, default: Date.now},
    modified: {type: Date, required: true, default: Date.now},
    name: {type: String, required: true},
    value: {type: Schema.Types.Mixed, required: true}
});
settingsSchema.index({userId: 1, name: 1}, {unique: true});

var Setting = mongoose.model('Settings', settingsSchema);

// Service
var service = {};

service.update = function (name, value, userId, callback) {
    Setting.findOne({userId: userId, name: name}, function (err, setting) {
        if (err) {
            return callback(err);
        }

        if (!setting) {
            setting = new Setting();
            setting.userId = userId;
            setting.name = name;
        }
        setting.value = value;
        setting.modified = Date.now();
        setting.save(function (err) {
            callback(err, setting);
        });
    });
};

service.findAll = function (userId, callback) {
    Setting.find({userId: userId}, function (err, userSettings) {
        if (err) {
            return callback(err);
        }
        var mapSettings = {},
            totalSettings,
            finalSetting;

        userSettings.forEach(function (userSetting) {
            mapSettings[userSetting.name] = userSetting;
        });

        totalSettings = [];
        NOTIFICATIONS.forEach(function (notification) {
            finalSetting = {};
            finalSetting.name = notification.name;
            finalSetting.title = notification.title;
            finalSetting.description = notification.description;
            finalSetting.value = notification.defaultValue;

            var userSetting = mapSettings[notification.name];
            if (userSetting) {
                finalSetting.value = userSetting.value;
                finalSetting.created = userSetting.created;
                finalSetting.modified = userSetting.modified;
            }

            totalSettings.push(finalSetting);
        });

        callback(null, totalSettings);

    });
};


service.findOne = function (name, userId, callback) {
    service.findAll(userId, function (err, settings) {
        if (err) {
            return callback(err);
        }
        settings.forEach(function (setting) {
            if (setting.name === name) {
                return callback(null, setting);
            }
        });
    });
};


module.exports = {
    Service: service
};


