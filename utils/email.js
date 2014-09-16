
var AWS = require('aws-sdk');

//AWS.config.update({ region: 'us-west-1' });
var  SES = new AWS.SES();

exports.send = function(email,message){

    var params = {
        Destination: { /* required */
            ToAddresses: [
                email
                /* more items */
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data: message /* required */
                },
                Text: {
                    Data: message /* required */
                }
            },
            Subject: { /* required */
                Data: 'Mark Notification'
            }
        },
        Source: 'notification@mark.as' /* required */

    };
    SES.sendEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}