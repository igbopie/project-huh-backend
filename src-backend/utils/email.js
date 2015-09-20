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

console.log('Send Mail Status:' + sendEmails);

exports.send = function (email, message, subject) {
    subject = subject ? subject : 'Huhapp Notification';
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
                    Data: subject
                }
            },
            Source: 'info@huhapp.com' /* required */

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
