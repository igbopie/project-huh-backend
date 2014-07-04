var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require('../models/user').User
    , PAGE_LIMIT = 20
    , FEED_ACTION_REPLY_TO = "replyTo"
    , FEED_ACTION_CREATE_SEEM = "createSeem"
    , FEED_ACTION_FAVOURITE = "favourite"
    , Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , UserService = require("../models/user").Service
    , Utils = require('../utils/utils')
    , PUBLIC_USER_FIELDS ="username mediaId bio name";



//Service?
var service = {};

service.onInboxCreated = function(inbox){
    User.findOne({_id:inbox.ownerUserId},function(err,owner){
        if(err){
            console.error(err);
            return;
        }
        sendNotification(""+owner.username+" has left you a message");
    });
}


service.onSeemCreated =  function (seem){

   /* var feed = new Feed();

    feed.itemId = mainItem._id;
    feed.itemMediaId  = mainItem.mediaId;
    feed.itemCaption = mainItem.caption;
    feed.seemId = seem._id;
    feed.seemTitle = seem.title;
    feed.action = FEED_ACTION_CREATE_SEEM;
    feed.user = user._id;

    feed.save(function(err){
        if(err){
            console.log("Error saving feed"+err);
            return;// ignore errors here
        }
        //TODO do this on a background job
        processSendMessageToFollowers(0,user,"@"+user.username+" has created a seem",feed.action,feed.seemId,feed.itemId)

    });*/
    /*
    var timeLeft = seem.expire.getTime() - new Date().getTime();
    var timeLeftMessage = "";
    //Milliseconds
    timeLeft = timeLeft /1000;
    if(timeLeft < 60) //1 minute
    {
        timeLeftMessage+=Math.round(timeLeft)+" seconds";
    }else if(timeLeft < (60*60)) //1 hour
    {
        timeLeftMessage+=Math.round(timeLeft/(60))+" minutes";
    }else if(timeLeft < (60*60*24)) //1 day
    {
        timeLeftMessage+=Math.round(timeLeft/(60*60))+" hours";
    }else if(timeLeft < (60*60*24*30)) //1 month
    {
        timeLeftMessage+=Math.round(timeLeft/(60*60*24))+" days";
    }else{
        timeLeftMessage+=" several days";
    }

    User.findOne({_id:seem.user},function(err,user){
        if(!err) {
            processSendMessageToFollowers(0, user, "@" + user.username + " has created a seem \"" + seem.title + "\". It will expire in " + timeLeftMessage + ". Hurry Up!", FEED_ACTION_CREATE_SEEM, seem._id)
        }else{
            console.error(err);
        }
    });
    */
}

service.onItemAdded =  function (item){
    /*//----------------
    //Create a feed item
    //----------------
    var feed = new Feed();

    feed.itemId = item._id;
    feed.itemMediaId  = item.mediaId;
    feed.itemCaption = item.caption;
    feed.replyToId = replyToObj._id;
    if(replyToObj) {
        feed.replyToMediaId = replyToObj.mediaId;
        feed.replyToCaption = replyToObj.caption;
        feed.replyToUser = replyToObj.user;
    }
    feed.seemId = seem._id;
    feed.seemTitle = seem.title;
    feed.action = FEED_ACTION_REPLY_TO;
    feed.user = user._id;

    feed.save(function(err){
        if(err){
            console.log("Error saving feed"+err);
            return;// ignore errors here
        }
        //TODO do this on a background job
        UserService.findUserById(replyToObj.user,function(err,replyToObjUser){
            if(err){
                console.log(err);
            }else {
                var message = "@" + user.username + " has added to '" + seem.title + "'";
                if (replyToObjUser && replyToObjUser.username != user.username) {
                    message = "@" + user.username + " has replied to @" + replyToObjUser.username;
                }
                processSendMessageToFollowers(0, user, message, feed.action, feed.seemId, feed.itemId);
            }
        })


    });*/
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
