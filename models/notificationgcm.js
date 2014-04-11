var gcm = require('node-gcm');

// create a message with default values
var message = new gcm.Message();

// or with object values
var message = new gcm.Message({
    collapseKey: 'Hola',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        key1: 'message1',
        key2: 'message2'
    }
});
//SERVER API
var sender = new gcm.Sender('AIzaSyBgwroEOl_pv6lri5tO-fEBNguSQHRj6N8');
var registrationIds = [];

// At least one required
registrationIds.push('APA91bG8wnSa_QXvsrqRhu1528mPXXaTzk1Z8tAPnpOzyPDppvsexh0a54M_GkrpfC9BKy4pNP8Bq-PTU1sDI8aTHsGQ3VM2DYTYIi7Nn8oN3kqHNFDM_nmItYAY49mznFKXnqscZIcOsrmxzO0FsLIKb393CXUoYQfBhCOodI0KyOSOfDVJYTE');

/**
 * Params: message-literal, registrationIds-array, No. of retries, callback-function
 **/
sender.send(message, registrationIds, 4, function (err, result) {
    console.log(result);
});