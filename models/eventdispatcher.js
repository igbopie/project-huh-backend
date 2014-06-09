var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Follow = require('../models/follow').Follow
    , Schema = mongoose.Schema
    , PAGE_LIMIT = 20
    , FEED_ACTION_REPLY_TO = "replyTo"
    , FEED_ACTION_CREATE_SEEM = "createSeem"
    , FEED_ACTION_FAVOURITE = "favourite"
    , Apn = require("../utils/apn")
    , Gcm = require("../utils/gcm")
    , FollowService = require("../models/follow").Service
    , UserService = require("../models/user").Service
    , Utils = require('../utils/utils')
    , PUBLIC_USER_FIELDS ="username mediaId bio name";



//Service?
var service = {};


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

function processSendMessageToFollowers(page,user,message,type,seemId,itemId){

    FollowService.findFollowers(user._id,page,function(err,followers){
        if(err){
            console.log("Error sending notifications"+err);
            return;// ignore errors here
        }

        for(var i = 0;i < followers.length;i++){
            var follow = followers[i];
            UserService.findUserById(follow.followerId,function(err,followerInfo){
                if(followerInfo.apnToken){
                    Apn.send(followerInfo.apnToken,message,{type:type,seemId:seemId,itemId:itemId});
                }
                if(followerInfo.gcmToken){
                    Gcm.send(followerInfo.gcmToken,message,{type:type,seemId:seemId,itemId:itemId});
                }
            });
        }

        if(followers.length > 0 ){
            processSendMessageToFollowers(page+1,user,message,seemId,itemId);
        }

    });

}
