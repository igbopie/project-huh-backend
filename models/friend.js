var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , FRIEND_STATUS_REQUEST= 0
    , FRIEND_STATUS_FRIENDSHIP = 1
    , FRIEND_STATUS_BLOCKED = 2
    , FRIEND_STATUS = [FRIEND_STATUS_REQUEST,FRIEND_STATUS_FRIENDSHIP,FRIEND_STATUS_BLOCKED]
    , textSearch = require('mongoose-text-search');

var User = require('../models/user').User,
    UserService = require('../models/user').Service,
    PUBLIC_USER_FIELDS = require('../models/user').PUBLIC_USER_FIELDS;

var friendSchema = new Schema({
    userId		:   { type: Schema.Types.ObjectId, required: true , ref:"User"}
    , friendUserId: {	type: Schema.Types.ObjectId, required: true , ref:"User"}
    , status    :   { type: Number, enum: FRIEND_STATUS,required:true, default:FRIEND_STATUS_REQUEST}
    , accepted		:   { type: Date	, required: false }
    , requested :   { type: Date	, required: false }
    , blocked   :   { type: Date	, required: false }
});


friendSchema.index({userId:1,friendUserId:1},{unique:true});
friendSchema.index({userId:1,friendUserId:1,status:1});
friendSchema.index({userId:1,status:1});
friendSchema.index({friendUserId:1,status:1});
var Friend = mongoose.model('Friend', friendSchema);


var service = {};

service.findFriends = function(userId,callback){
    Friend.find({userId:userId,status:FRIEND_STATUS_FRIENDSHIP})
        .populate("friendUserId",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){

            docs = docs.map(function(friend) {
                return friend.friendUserId;
            });

            callback(err,docs);
        });
}

service.addFriend = function(username,userId,callback){
    UserService.findUserByUsername(username,function(err,friendUser){
        if(err){
            callback(err);
        } else if(!friendUser){
            callback(null,null);
        } else {
            var friend = new Friend();
            friend.userId = userId;
            friend.friendUserId = friendUser._id;
            friend.status = FRIEND_STATUS_FRIENDSHIP;
            friend.requested = Date.now();
            friend.save(function(err){
                if(err){
                    callback(err);
                } else {
                    callback(null,{_id:friendUser._id,username:friendUser.username,name:friendUser.name,mediaId:friendUser.mediaId});
                }
            });
        }
    });
}

service.unfriend =  function(fromUserId,toUserId,callback){
    Friend.findOne({userId:toUserId,friendUserId:fromUserId},function(err,friendRequest) {
        if (err) {
            return callback(err);
        } else if (!friendRequest) {
            return callback("User not found");
        }
        //Just remove it.
        friendRequest.remove(function (err) {
            if (err) {
                return callback(err);
            }
            callback();
        });
    });
}

service.isFriend = function(fromUserId,toUserId,callback){
    Friend.findOne({userId:fromUserId,friendUserId:toUserId,status:FRIEND_STATUS_FRIENDSHIP},function(err,friend){
        if(err) return callback(err);
        if(!friend) return callback(null,false);
        if(friend) return callback(null,true);
    });


}

service.search = function(query,userId,callback){
    Friend.find({userId:userId,status:FRIEND_STATUS_FRIENDSHIP},function(err,results){
        if(err) return callback(err);


        results = results.map(function(friend) {
            return friend.friendUserId;
        });

        var options = {
            project: {_id:1,username:1,name:1}           // do not include the `created` property
            , filter: { _id:{ $in:results}} // casts queries based on schema
            , limit: 20
            , language: 'english'
            , lean: true
        }

        User.textSearch(query, options,  function (err, output) {
            if (err) return callback(err);

            //console.log(output);

            var results = output.results.map(function(textSearchResult) {
                return textSearchResult.obj;
            });
            callback(null,results);

        });
    });


}

function UserNotFoundError(message) {
    this.name = 'UserNotFoundError';
    this.message = message;
    this.stack = (new Error()).stack;
}
UserNotFoundError.prototype = new Error;


function FriendsLimitExceeded(message) {
    this.name = 'FriendsLimitExceeded';
    this.message = message;
    this.stack = (new Error()).stack;
}
FriendsLimitExceeded.prototype = new Error;


module.exports = {
    Friend: Friend,
    Service:service
};