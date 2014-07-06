var Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , UserService = require("../models/user").Service;


var service = {};

service.onInboxCreated = function(inbox){
    UserService.findUserById({_id:inbox.ownerUserId},function(err,owner){
        if(err){
            console.error(err);
            return;
        }
        sendNotification(""+owner.username+" has left you a message");
    });
}



module.exports = {
    Service:service
};

function sendNotification(userId,message){
    UserService.findUserById(userId,function(err,user){
        if(err){
            console.error(err);
            return;
        }
        if(user.apnToken){
            Apn.send(user.apnToken,message);
        }
        if(user.gcmToken){
            Gcm.send(user.gcmToken,message);
        }
    });
}
