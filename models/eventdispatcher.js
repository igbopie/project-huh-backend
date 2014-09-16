var Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
    , UserService = require("../models/user").Service
    , ItemService = require("../models/item").Service;


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

service.onCommentAdded = function(itemId,userId){
    ItemService.findOne({_id:itemId})
        .populate("comments.userId",PUBLIC_USER_FIELDS)
        .exec(function(err,item){
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
                    if(String(item.userId) != String(comment.userId._id) && //It is not the owner
                        String(userCommented._id) != String(comment.userId._id) ) //it is not the same user
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
