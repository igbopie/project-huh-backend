'use strict';
var gcm = require('node-gcm');


//SERVER API
var sender = new gcm.Sender('AIzaSyAktpzvWfAxgvln5K1Ndrir1nKxN8xxJw0');

//'APA91bG8wnSa_QXvsrqRhu1528mPXXaTzk1Z8tAPnpOzyPDppvsexh0a54M_GkrpfC9BKy4pNP8Bq-PTU1sDI8aTHsGQ3VM2DYTYIi7Nn8oN3kqHNFDM_nmItYAY49mznFKXnqscZIcOsrmxzO0FsLIKb393CXUoYQfBhCOodI0KyOSOfDVJYTE'
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