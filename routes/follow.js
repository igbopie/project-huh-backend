var NOTIFICATION_TYPES = require('../models/user').NOTIFICATION_TYPES;
var UserService = require('../models/user').Service;
var User = require('../models/user').User;
var FollowService = require('../models/follow').Service; 
var Follow = require('../models/follow').Follow;
var ApiUtils = require('../utils/apiutils'); 


/*
 * GET users listing.
 */

exports.followers = function(req, res){
	
	var username = req.body.username;
	var page = req.body.page;
	UserService.findUserByUsername(username,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			FollowService.findFollowers(user._id,page,function(err,docs){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else{
					ApiUtils.api(req,res,ApiUtils.OK,null,docs);
				}
				
			});
		}
	})
};


exports.following = function(req, res){

    var username = req.body.username;
	var page = req.body.page;
	UserService.findUserByUsername(username,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			FollowService.findFollowing(user._id,page,function(err,docs){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else{
					ApiUtils.api(req,res,ApiUtils.OK,null,docs);
				}
				
			});
		}
	})
};


exports.follow = function(req, res){
	var token = req.body.token;
	var username = req.body.username;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			//find user by username
			UserService.findUserByUsername(username,function(err,userToBeFollowed){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else if(!userToBeFollowed){
					ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"User not found",null);
				} else {
					FollowService.findFollow(user._id,userToBeFollowed._id,function(err,alreadyFollow){
						if(err){
							ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
						} else if (alreadyFollow){
							ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_ALREADY_EXISTS,"Already following",null);
						} else {
							var follow = new Follow();
					
							follow.followerId = user._id;
							follow.followerUsername = user.username;
							
							follow.followedId = userToBeFollowed._id;
							follow.followedUsername = userToBeFollowed.username;
							
							follow.save(function(err){
									if(err){
										ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
									} else {
                                        //Increase count of follow/followers
                                        User.update({_id: user._id}, {$inc: {following: 1}}, function (err) {
                                            if(err) return ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);

                                            User.update({_id: userToBeFollowed._id}, {$inc: {followers: 1}}, function (err) {
                                                if (err) return ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);

                                                //Send notification
                                                userToBeFollowed.createNotification(NOTIFICATION_TYPES.FOLLOW, user.username, function (err) {
                                                    if (err) {
                                                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                                                    } else {
                                                        ApiUtils.api(req, res, ApiUtils.OK, null, null);
                                                    }
                                                });
                                            });
                                        });
										
									}
							});
						}
					});
				}
			});
			
		}
	})
};

exports.unfollow = function(req, res){
	var token = req.body.token;
	var username = req.body.username;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			//find user by username
			UserService.findUserByUsername(username,function(err,userToBeFollowed){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else if(!userToBeFollowed){
					ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"User not found",null);
				} else {
					FollowService.findFollow(user._id,userToBeFollowed._id,function(err,alreadyFollow){
						if(err){
							ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
						} else if (!alreadyFollow){
							ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_ALREADY_EXISTS,"Not following",null);
						} else {
							alreadyFollow.remove(function(err){
                                //Decrease count of follow/followers
                                User.update({_id: user._id}, {$inc: {following: -1}}, function (err) {
                                    if (err) return ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);

                                    User.update({_id: userToBeFollowed._id}, {$inc: {followers: -1}}, function (err) {
                                        if (err) {
                                            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                                        } else {
                                            ApiUtils.api(req, res, ApiUtils.OK, null, null);
                                        }
                                    });
                                });
								
							});
						}
					});
				}
			});
			
		}
	})
};
