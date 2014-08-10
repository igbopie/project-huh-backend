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