var gcm = require('node-gcm');


//SERVER API
var sender = new gcm.Sender('AIzaSyBgwroEOl_pv6lri5tO-fEBNguSQHRj6N8');

//'APA91bG8wnSa_QXvsrqRhu1528mPXXaTzk1Z8tAPnpOzyPDppvsexh0a54M_GkrpfC9BKy4pNP8Bq-PTU1sDI8aTHsGQ3VM2DYTYIi7Nn8oN3kqHNFDM_nmItYAY49mznFKXnqscZIcOsrmxzO0FsLIKb393CXUoYQfBhCOodI0KyOSOfDVJYTE'
exports.send = function(token,messageString,data){
    // or with object values
    var message = new gcm.Message({
        collapseKey: messageString,
        delayWhileIdle: true,
        timeToLive: 3,
        data: data
    });

    var registrationIds = [];
    registrationIds.push(token);

    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, registrationIds, 4, function (err, result) {
        console.log(result);
    })

}