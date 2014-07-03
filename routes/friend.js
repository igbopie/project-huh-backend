var UserService = require('../models/user').Service;
var User = require('../models/user').User;
var FriendService = require('../models/friend').Service;
var ApiUtils = require('../utils/apiutils');


/*
 * GET users listing.
 */

exports.friends = function(req, res){
    ApiUtils.auth(req,res,function(user){
        FriendService.findFriends(user._id,function(err,friends){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,friends);
            }
        });
    });
};
exports.requests = function(req, res){
    ApiUtils.auth(req,res,function(user){
        FriendService.findFriendRequests(user._id,function(err,friends){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,friends);
            }
        });
    });
};
exports.sendFriendRequest = function(req, res){
    ApiUtils.auth(req,res,function(user){
        var toUserId = req.body.userId;
        FriendService.sendFriendRequest(user._id,toUserId,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
};
exports.acceptFriendRequest = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var fromUserId = req.body.userId;
        FriendService.acceptFriendRequest(fromUserId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        })
    });
};
exports.declineFriendRequest = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var fromUserId = req.body.userId;
        FriendService.declineFriendRequest(fromUserId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        })
    });
};

exports.unfriend = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var fromUserId = req.body.userId;
        FriendService.unfriend(fromUserId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        })
    });
};