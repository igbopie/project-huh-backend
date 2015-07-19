'use strict';
var gcm = require('node-gcm');


// SERVER API
var sender = new gcm.Sender('AIzaSyAktpzvWfAxgvln5K1Ndrir1nKxN8xxJw0');

exports.send = function (token, messageString, data) {
    // or with object values
    var registrationIds = [],
        message = new gcm.Message(
            {
                collapseKey: messageString,
                delayWhileIdle: true,
                timeToLive: 3,
                data: data
            }
        );

    registrationIds.push(token);

    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, registrationIds, 4, function (err, result) {
        if (err) {
            console.error(err);
        }
        console.log(result);
    });

};
