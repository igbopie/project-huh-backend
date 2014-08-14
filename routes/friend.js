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

exports.addFriend = function(req, res){
    ApiUtils.auth(req,res,function(user){
        var username = req.body.username;
        if(!username){
            ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_BAD_REQUEST, null, null);
        }else {
            FriendService.addFriend(username, user._id, function (err, friendId) {
                if (err) {
                    console.error(err);
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, friendId);
                }
            });
        }
    });

};


exports.deleteFriend = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var fromUserId = req.body.userId;
        FriendService.deleteFriend(fromUserId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        })
    });
};

exports.listBlocked = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        FriendService.listBlocked(user._id,function(err,list){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,list);
            }
        })
    });
};

exports.block = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var fromUserId = req.body.userId;
        FriendService.block(fromUserId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        })
    });
};


exports.unblock = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var fromUserId = req.body.userId;
        FriendService.unblock(fromUserId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        })
    });
};


exports.search = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var query = req.body.query;
        FriendService.search(query,user._id,function(err,results){
            if(err){
                console.log(err);
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,results);
            }
        })
    });
};