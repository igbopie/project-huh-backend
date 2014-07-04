var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , FRIEND_STATUS_REQUEST= 0
    , FRIEND_STATUS_FRIENDSHIP = 1
    , FRIEND_STATUS_BLOCKED = 2
    , FRIEND_STATUS = [FRIEND_STATUS_REQUEST,FRIEND_STATUS_FRIENDSHIP,FRIEND_STATUS_BLOCKED];

var User = require('../models/user').User,
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
            callback(err,docs);
        });
}

service.findFriendRequests = function(userId,callback){
    Friend.find({friendUserId:userId,status:FRIEND_STATUS_REQUEST})
        .populate("userId",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
            callback(err,docs);
        });
}
service.sendFriendRequest = function(fromUserId,toUserId,callback){
    //TODO Check only one user request to a user and not already friends
    User.findOne({_id:fromUserId},function(err,fromUser){
        if(err){
            return callback(err);
        }else if(!fromUser){
            return callback(new UserNotFoundError("User "+fromUserId+" does not exist"));
        }

        //else if(fromUser.friends.length == FRIENDS_LIMIT){
        //    return callback(new FriendsLimitExceeded("User "+fromUserId+" exceeded the number of friends"));
        //}

        User.findOne({_id:toUserId},function(err,toUser){
            if(err){
                return callback(err);
            }else if(!toUser){
                return callback(new UserNotFoundError("User "+toUserId+" does not exist"));
            }

            //else if(toUser.friends.length == FRIENDS_LIMIT){
            //    return callback(new FriendsLimitExceeded("User "+toUserId+" exceeded the number of friends"));
            //}

            var friend = new Friend();
            friend.userId = fromUserId;
            friend.friendUserId = toUserId;
            friend.requested = Date.now();
            friend.status = FRIEND_STATUS_REQUEST;

            friend.save(function(err) {
                callback(err);
            });
        });

    });

}

service.acceptFriendRequest = function(fromUserId,toUserId,callback){
    Friend.findOne({userId:fromUserId,friendUserId:toUserId},function(err,friendRequest){
        if(err){
            return callback(err);
        } else if(!friendRequest){
            return callback("User not found");
        }
        friendRequest.status = FRIEND_STATUS_FRIENDSHIP;
        friendRequest.accepted = Date.now();
        friendRequest.save(function(err){
            if(err){
                return callback(err);
            }
            var friendRequestOtherSide = new Friend();
            friendRequestOtherSide.userId = friendRequest.friendUserId;
            friendRequestOtherSide.friendUserId = friendRequest.userId;
            friendRequestOtherSide.requested = friendRequest.requested;
            friendRequestOtherSide.accepted = friendRequest.accepted;
            friendRequestOtherSide.status = friendRequest.status;
            friendRequestOtherSide.save(function(err){
                if(err){
                    //TODO Try to recover!
                    friendRequest.status = FRIEND_STATUS_REQUEST;
                    delete friendRequest.accepted;

                    friendRequest.save(function(err){
                        //PRAY
                        console.error("Could rollback an error ocurred while trying to accept a friendship: "+err);
                    });
                    return callback(err);
                }
                callback();
            })
        })
    });
}

service.declineFriendRequest = function(fromUserId,toUserId,callback){
    Friend.findOne({userId:fromUserId,friendUserId:toUserId},function(err,friendRequest){
        if(err){
            return callback(err);
        } else if(!friendRequest){
            return callback("User not found");
        }
        //Just remove it.
        friendRequest.remove(function(err) {
            if (err) {
                return callback(err);
            }
            callback();
        });
    });
}
service.unfriend =  function(fromUserId,toUserId,callback){
    Friend.findOne({userId:fromUserId,friendUserId:toUserId},function(err,friendRequest) {
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
            Friend.findOne({userId: toUserId, friendUserId: fromUserId}, function (err, friendRequest) {
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