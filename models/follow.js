var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	dateUtils = require('date-utils')
  , Utils = require('../utils/utils')
  , PAGE_LIMIT = 20;



var followSchema = new Schema({
	followerId		: {	type: Schema.Types.ObjectId, required: true, index: { unique: false}}
  , followerUsername	: { type: String	, required: true}
  , followedId		: {	type: Schema.Types.ObjectId, required: true, index: { unique: false}}
  , followedUsername	: { type: String	, required: true}
  , date		: { type: Date	, required: true, default: Date.now }
 
 });


var follow = mongoose.model('follow', followSchema);

//Service?
var service = {};
service.findFollowers = function(userId,page,callback){
	follow.find({"followedId":userId})
	.limit(PAGE_LIMIT)
	.skip(PAGE_LIMIT*page)
	.exec(function(err, followers) {
     	if(err) {
			callback(err);
		} else {
			callback(null,followers);
		}
	 });
};

service.findFollowing = function(userId,page,callback){
	follow.find({"followerId":userId})
	.limit(PAGE_LIMIT)
	.skip(PAGE_LIMIT*page)
	.exec(function(err, following) {
     	if(err) {
			callback(err);
		} else {
			callback(null,following);
		}
	 });
};

service.findFollow = function(followerUserId,followedUserId,callback){
	follow.findOne({"followerId":followerUserId,"followedId":followedUserId},function(err, follow) {
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