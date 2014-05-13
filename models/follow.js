var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	dateUtils = require('date-utils')
  , Utils = require('../utils/utils')
  , PAGE_LIMIT = 20
  , PUBLIC_USER_FIELDS ="username mediaId bio name";



var followSchema = new Schema({
	follower		: {	type: Schema.Types.ObjectId, required: true, ref:"User"}
  , followed		: {	type: Schema.Types.ObjectId, required: true, ref:"User"}
  , date		: { type: Date	, required: true, default: Date.now }
 
 });

followSchema.index({ follower: 1,followed:1 }, { unique: true });
Utils.joinToUser(followSchema,"follower","followerId","followerUsername");
Utils.joinToUser(followSchema,"followed","followedUserId","followedUsername");

var follow = mongoose.model('follow', followSchema);

//Service?
var service = {};
service.findFollowers = function(userId,page,callback){
	follow.find({"followed":userId})
	.limit(PAGE_LIMIT)
	.skip(PAGE_LIMIT*page)
    .select({follower:1,date:1,_id:0})
    .populate("follower",PUBLIC_USER_FIELDS)
	.exec(function(err, followers) {
     	if(err) {
			callback(err);
		} else {
			callback(null,followers);
		}
	 });
};

service.findFollowing = function(userId,page,callback){
	follow.find({"follower":userId})
    .select({followed:1,date:1,_id:0})
	.limit(PAGE_LIMIT)
	.skip(PAGE_LIMIT*page)
    .populate("followed",PUBLIC_USER_FIELDS)
	.exec(function(err, following) {
     	if(err) {
			callback(err);
		} else {
			callback(null,following);
		}
	 });
};

service.findFollow = function(followerUserId,followedUserId,callback){
	follow.findOne({"follower":followerUserId,"followed":followedUserId},function(err, follow) {
     	if(err) {
			callback(err);
		} else {
			callback(null,follow);
		}
	 });
};


module.exports = {
  Follow: follow,
  Service:service
};