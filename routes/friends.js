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
					var addFriend = true;
					//check if already added 
					for(var i = 0;i < userToBeAdded.friends.length && addFriend; i++){
						var friend = userToBeAdded.friends[i];
						if(friend.friendId == user._id){
							addFriend = false;
						}
					}
					
					//check if already requested
					for(var i = 0;i < userToBeAdded.friendRequests.length && addFriend; i++){
						var friend = userToBeAdded.friendRequests[i];
						if(friend.friendId == user._id){
							addFriend = false;
						}
					}
					//TODO check friends limits!
					
					if(addFriend){
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
			var toBeAddedIndex = -1;
			for(var i = 0;i < user.friendRequests.length && toBeAddedIndex < 0; i++){
				var friend = user.friendRequests[i];
				
				if(friend.friendUsername == username){
					toBeAddedIndex = i;
				}
			}
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
						//find user by username
						UserService.findUserByUsername(friendRequest.friendUsername,function(err,userToBeAdded){
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

};

exports.remove = function(req, res){

};