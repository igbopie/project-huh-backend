var UserService = require('../models/user').Service; 
var ApiUtils = require('../utils/apiutils'); 


/*
 * GET users listing.
 */

exports.list = function(req, res){
	
	var token = req.body.token;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			ApiUtils.api(req,res,ApiUtils.OK,null,user.friends);
		}
	})
	
	
};

exports.add = function(req, res){
	var token = req.body.token;
	var username = req.body.username;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			//find user by username
			UserService.findUserByUsername(username,function(err,userToBeAdded){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else if(!userToBeAdded){
					ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"Friend not found",null);
				} else {
					
					//check if already added 
					var friendIndex = user.findFriendIndex(username);
					
					//check if already requested
					var requestedIndex = user.findFriendRequestIndex(username);
					
					//TODO check friends limits!
					if(friendIndex < 0 && requestedIndex < 0){
						var request = {};
						request.friendId = user._id;
						request.friendUsername = user.username;
						
						userToBeAdded.friendRequests.push(request);
						userToBeAdded.save(function(err){
							if(err){
								ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
							} else {
								//TODO send PUSH notification
								console.log("PUSH notification to: "+userToBeAdded.username);
								ApiUtils.api(req,res,ApiUtils.OK,null,null);
							}
							
						});
						
						ApiUtils.api(req,res,ApiUtils.OK,null,null);
					} else {
						ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_ALREADY_EXISTS,null,null);
					}
				}
			});
			
		}
	})
};


exports.pending = function(req, res){
	var token = req.body.token;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			ApiUtils.api(req,res,ApiUtils.OK,null,user.friendRequests);

		}
	});
};

exports.accept = function(req, res){
	var token = req.body.token;
	var username = req.body.username;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			var toBeAddedIndex = user.findFriendRequestIndex(username);
			if(toBeAddedIndex < 0){
				ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"Friend request not found",null);
			}else{
				//Weelll we need an atomic operation here...
				var friendRequest = user.friendRequests.splice(toBeAddedIndex,1)[0];
				var friend = {};
				
				friend.friendId	= friendRequest.friendId;
				friend.friendUsername = friendRequest.friendUsername;
				friend.dateRequested = friendRequest.dateRequested;
				
				user.friends.push(friend);
				user.save(function(err){
					if(err){
						ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
					} else {
						UserService.findUserById(friendRequest.friendId,function(err,userToBeAdded){
							if(err && !userToBeAdded){
								//TODO undo friend add operation	
								ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
							} else {
								var friendMe = {};
								
								friendMe.friendId	= user._id;
								friendMe.friendUsername = user.username;
								friendMe.dateRequested = friendRequest.dateRequested;
								
								userToBeAdded.friends.push(friendMe);
								userToBeAdded.save(function(err){
									if(err){
										//TODO undo friend add operation	
										ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
									} else {
										ApiUtils.api(req,res,ApiUtils.OK,null,null);
									}
								});
							}
						});
					}
				})
			}
		}
	});
};

exports.decline = function(req, res){
	var token = req.body.token;
	var username = req.body.username;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			var toBeAddedIndex = user.findFriendRequestIndex(username);
			if(toBeAddedIndex < 0){
				ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"Friend request not found",null);
			}else{
				var friendRequest = user.friendRequests.splice(toBeAddedIndex,1)[0];
				user.save(function(err){
					if(err){
						ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
					} else {
						ApiUtils.api(req,res,ApiUtils.OK,null,null);
					}
				})
			}
		}
	});

};

exports.remove = function(req, res){
	var token = req.body.token;
	var username = req.body.username;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			var toBeRemovedIndex = user.findFriendIndex(username);
			if(toBeRemovedIndex < 0){
				ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"Friend not found",null);
			}else{
				var friendship = user.friends.splice(toBeRemovedIndex,1)[0];
				user.save(function(err){
					if(err){
						ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
					} else {
						UserService.findUserById(friendship.friendId,function(err,userToBeRemoved){
							if(err && !userToBeAdded){
								//TODO undo friend add operation	
								ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
							} else {
								var toBeRemovedBIndex = userToBeRemoved.findFriendIndex(user.username);
								if(toBeRemovedBIndex < 0){
									//TODO undo friend add operation
									ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,"Friend not found",null);
								} else {
									var friendshipB = userToBeRemoved.friends.splice(toBeRemovedBIndex,1)[0];
									userToBeRemoved.save(function(err){
										if(err){
											ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
										} else {
											ApiUtils.api(req,res,ApiUtils.OK,null,null);
										}
									});
								}
							}
						});
					}
				})
			}
		}
	});
};