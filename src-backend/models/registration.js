'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Utils = require('../utils/utils'),
    emailService = require('../utils/email');


var registrationSchema = new Schema({
    email: {type: String, required: true, index: { unique: true }},
    platform: {type: String, required: true},
    created: {type: Date, required: true, default: Date.now},
    updated: {type: Date, required: true, default: Date.now}
});


registrationSchema.index({created: -1});

var Registration = mongoose.model('Registration', registrationSchema);

// Service?
var RegistrationService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Service: RegistrationService
};


RegistrationService.create = function (email, platform, callback) {

    Registration.findOne({email: email}, function (err, registration) {
        if (err) {
            return callback(err);
        }

        if (registration) {
            return callback(Utils.error(Utils.ERROR_CODE_ALREADY_EXISTS, 'Already registered'));
        }

        registration = new Registration();

        registration.email = email;
        registration.platform = platform;

        // TODO Validation
        registration.save(callback);

        emailService.send(
            'devs@huhapp.com',
            'Hi,<br>\n'+
            'New registration: '+email+'<br>\n'+
            'Platform: '+ platform +'<br>\n',
            '[REGISTRATIONS] New registration');

        emailService.send(
            email,
            'Hello,<br>\n<br>\n'+
            'Thank you for participating in our beta. Our monkeys are a little busy right now' +
            ', but you will receive an email with the instructions to install our app soon. <br>\n<br>\n'+
            'Thank you and eat more jelly donuts,<br>\n The Mummy ',
            'Thank you for trying Huh?');
    });

};

RegistrationService.list = function (callback) {
    Registration
        .find({})
        .sort({created: -1})
        .exec(function (err, registrations) {
            if (err) {
                return callback(err);
            }

            callback(undefined, registrations);
        }
    );
};
