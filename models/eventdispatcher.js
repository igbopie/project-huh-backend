var Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , UserService = require("../models/user").Service;


var service = {};

service.onItemInboxCreated = function(inbox){

    UserService.findUserById({_id:inbox.ownerUserId},function(err,owner){
        if(err){
            console.error(err);
            return;
        }
        if(!owner){
            console.error("Couldn't find owner: "+inbox.ownerUserId);
            return;
        }
        sendNotification(inbox.userId,""+owner.username+" has left you a Mark",{itemId:inbox.itemId});
    });
}



module.exports = {
    Service:service
};

function sendNotification(userId,message,data){

    UserService.findUserById(userId,function(err,user){
        if(err){
            console.error(err);
            return;
        }
        if(!user){
            console.error("User not found:"+user);
            return;
        }
        if(user.apnToken){
            Apn.send(user.apnToken,message,data);
        }
        if(user.gcmToken){
            Gcm.send(user.gcmToken,message,data);
        }
        console.log("Notification To:"+userId+" Msg:"+message);
    });
}
