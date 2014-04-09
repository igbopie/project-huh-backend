var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Follow = require('../models/follow').Follow
    , Schema = mongoose.Schema
    , FEED_ACTION_REPLY_TO = "replyTo"
    , FEED_ACTION_CREATE_SEEM = "createSeem"
    , PAGE_LIMIT = 20;


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

module.exports = {
    Feed: Feed,
    Service:service
};