var Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
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

service.onItemViewed = function(itemId,userId) {
    var ItemService = require("../models/item").Service;
    ItemService.findById(itemId, function (err, item) {
        if (err) {
            console.error(err);
            return;
        }
        if (!item) {
            console.error("No item found");
            return;
        }
        UserService.findUserById({_id:userId},function(err,userViewed) {
            if (err) {
                console.error(err);
                return;
            }
            if (!userViewed) {
                console.error("No user found");
                return;
            }
            sendNotification(item.userId, "" + userViewed.username + " viewed your Mark", {itemId: item._id});
        });
    });
}
service.onCommentAdded = function(itemId,userId){
    var ItemService = require("../models/item").Service;
    ItemService.findById(itemId,function(err,item){
            if(err){
                console.error(err);
                return;
            }
            if(!item){
                console.error("No item found");
                return;
            }

            UserService.findUserById({_id:userId},function(err,userCommented){
                if(err){
                    console.error(err);
                    return;
                }
                if(!userCommented){
                    console.error("No user found");
                    return;
                }

                sendNotification(item.userId,""+userCommented.username+" commented on your Mark",{itemId:item._id});

                item.comments.forEach(function(comment){
                    if(String(item.userId) != String(comment.userId) && //It is not the owner
                        String(userCommented._id) != String(comment.userId) ) //it is not the same user
                    {
                        sendNotification(comment.userId._id,""+userCommented.username+" commented on a Mark you commented",{itemId:item._id});
                    }
                });

            });


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
