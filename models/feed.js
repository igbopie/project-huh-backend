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
    , UserService = require("../models/user").Service;


var feedSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    itemId          :   {	type: Schema.Types.ObjectId, required: false},
    itemMediaId     :   {	type: Schema.Types.ObjectId, required: false},
    itemCaption     :   {	type: String, required: false},
    replyToId       :   {	type: Schema.Types.ObjectId, required: false},
    replyToMediaId  :   {	type: Schema.Types.ObjectId, required: false},
    replyToCaption  :   {	type: String, required: false},
    replyToUsername :   {	type: String, required: false},
    replyToUserId   :   {	type: Schema.Types.ObjectId, required: false},
    seemId          :   {	type: Schema.Types.ObjectId, required: false},
    seemTitle       :   {	type: String, required: false},
    action          :   {	type: String, required: false}, //REPLY_TO, CREATE_SEEM
    userId          :   {	type: Schema.Types.ObjectId, required: true},
    username        :   {	type: String, required: true}

})

feedSchema.index({ userId:1 })
var Feed = mongoose.model('feed', feedSchema);


//Service?
var service = {};

service.findByMyFeed = function (user,page,callback){
     Follow.find({"followerId":user.id},{"followedId":1,"_id":0}).exec(
         function(err,follows){
             var followArray = new Array();
             for(var i = 0; i < follows.length;i++) {
                 var fItem = follows[i];
                 followArray.push(fItem.followedId);
             }
             followArray.push(user._id);
             Feed.find({"userId":{"$in":followArray}})
                 .sort({ created: -1})
                 .limit(PAGE_LIMIT)
                 .skip(PAGE_LIMIT*page)
                 .exec(function(err, myfeed) {
                     if(err) {
                         callback(err);
                     } else {
                         callback(null,myfeed);
                     }
                 });
        });
}
service.findByUser =  function (user,page,callback) {
    Feed.find({"userId":user._id})
        .sort({ created: -1})
        .limit(PAGE_LIMIT)
        .skip(PAGE_LIMIT*page)
        .exec(function(err, myfeed) {
            if(err) {
                callback(err);
            } else {
                callback(null,myfeed);
            }
        });
}

service.onSeemCreated =  function (seem,mainItem,user){

    var feed = new Feed();

    feed.itemId = mainItem._id;
    feed.itemMediaId  = mainItem.mediaId;
    feed.itemCaption = mainItem.caption;
    feed.seemId = seem._id;
    feed.seemTitle = seem.title;
    feed.action = FEED_ACTION_CREATE_SEEM;
    feed.userId = user._id;
    feed.username = user.username;

    feed.save(function(err){
        if(err){
            console.log("Error saving feed"+err);
            return;// ignore errors here
        }
        //TODO do this on a background job
        processSendMessageToFollowers(0,user,"@"+user.username+" has created a seem",feed.seemId,feed.itemId)

    });
}

service.onReply =  function (seem,item,replyToObj,user){
    //----------------
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
        feed.replyToUserId = replyToObj.userId;
        feed.replyToUsername = replyToObj.username;
    }
    feed.seemId = seem._id;
    feed.seemTitle = seem.title;
    feed.action = FEED_ACTION_REPLY_TO;
    feed.userId = user._id;
    feed.username = user.username;

    feed.save(function(err){
        if(err){
            console.log("Error saving feed"+err);
            return;// ignore errors here
        }
        //TODO do this on a background job
        var message = "@"+user.username+" has replied to @"+replyToObj.username;
        if(replyToObj.username == undefined || replyToObj.username == feed.username){
            message= "@"+user.username+" has added to '"+seem.title+"'";
        }
        processSendMessageToFollowers(0,user,message,feed.seemId,feed.itemId)

    });
}

service.onFavourited =function (seem,item,user){
    var feed = new Feed();
    feed.itemId = item._id;
    feed.itemMediaId  = item.mediaId;
    feed.itemCaption = item.caption;
    feed.seemId = seem._id;
    feed.seemTitle = seem.title;
    feed.action = FEED_ACTION_FAVOURITE;
    feed.userId = user._id;
    feed.username = user.username;

    feed.save(function(err){
        if(err){
            console.log("Error saving feed"+err);
            return;// ignore errors here
        }
        //TODO do this on a background job
        processSendMessageToFollowers(0,user,"@"+user.username+" has favourited a photo",feed.seemId,feed.itemId)
    });

}



service.onThumbUp =function (seem,item,user){

}


service.onThumbDown =function (seem,item,user){

}

module.exports = {
    Feed: Feed,
    Service:service
};

function processSendMessageToFollowers(page,user,message,seemId,itemId){

    FollowService.findFollowers(user._id,page,function(err,followers){
        if(err){
            console.log("Error sending notifications"+err);
            return;// ignore errors here
        }

        for(var i = 0;i < followers.length;i++){
            var follow = followers[i];
            UserService.findUserById(follow.followerId,function(err,followerInfo){
                if(followerInfo.apnToken){
                    Apn.send(followerInfo.apnToken,message,{seemId:seemId,itemId:itemId});
                }
                if(followerInfo.gcmToken){
                    Gcm.send(followerInfo.gcmToken,message,{seemId:seemId,itemId:itemId});
                }
            });
        }

        if(followers.length > 0 ){
            processSendMessageToFollowers(page+1,user,message,seemId,itemId);
        }

    });

}
