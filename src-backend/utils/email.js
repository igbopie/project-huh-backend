'use strict';
var AWS = require('aws-sdk');

AWS.config.update({region: 'us-west-2'});
var SES = new AWS.SES();

var sendEmails = process.env.SEND_EMAIL;
if (!sendEmails) {
    sendEmails = false;
} else {
    sendEmails = Boolean(sendEmails);
}

exports.send = function (email, message) {
    if (!sendEmails) {
        console.log('Email sending disabled: to:' + email + ' message:' + message);
    } else {
        var params = {
            Destination: {
                /* required */
                ToAddresses: [
                    email
                    /* more items */
                ]
            },
            Message: {
                /* required */
                Body: {
                    /* required */
                    Html: {
                        Data: message /* required */
                    },
                    Text: {
                        Data: message /* required */
                    }
                },
                Subject: {
                    /* required */
                    Data: 'Mark Notification'
                }
            },
            Source: 'notification@mark.as' /* required */

        };
        SES.sendEmail(params, function (err, data) {
            if (err) {
                // an error occurred
                console.log(err, err.stack);
            } else {
                // successful response
                console.log(data);
            }
        });
    }
};
