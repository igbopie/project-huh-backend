


var service = {};
module.exports = {
    Service:service
};

var Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , Email = require("../utils/email")
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
    , UserService = require("../models/user").Service
    , Comment = require("../models/item").Comment;

service.onItemCreated = function(item){

    item.to.forEach(function(toUserId){

        UserService.findUserById({_id:item.userId},function(err,owner){
            if(err){
                console.error(err);
                return;
            }
            if(!owner){
                console.error("Couldn't find owner: "+item.userId);
                return;
            }
            sendNotification(item.userId,""+owner.username+" has left you a Mark",{itemId:item._id});
        });

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

            Comment.find({itemId:itemId},function(err,comments) {
                if (err) {
                    console.error(err);
                    return;
                }
                UserService.findUserById({_id: userId}, function (err, userCommented) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (!userCommented) {
                        console.error("No user found");
                        return;
                    }
                    //If I am not commenting on my post
                    if (String(item.userId) != String(userId)) {
                        sendNotification(item.userId, "" + userCommented.username + " commented on your Mark", {itemId: item._id});
                    }
                    var uniqueUsers = [];

                    for (var i = 0; i < comments.length; i++) {
                        var comment = comments[i];
                        uniqueUsers[String(comment.userId)] = true;
                    }

                    for (var commentAuthorUserId in uniqueUsers) {


                        if (String(item.userId) != String(commentAuthorUserId) && //It is not the owner
                            String(userCommented._id) != String(commentAuthorUserId)) //it is not the same user
                        {
                            sendNotification(commentAuthorUserId, "" + userCommented.username + " commented on a Mark you commented", {itemId: item._id});
                        }
                    }


                });
            });


    });


}




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
        if(user.email){
            Email.send(user.email,message);
        }
        console.log("Notification To:"+userId+" Msg:"+message);
    });
}
