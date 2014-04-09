
var User = require('../models/user').User; 
var UserService = require('../models/user').Service;
var FollowService = require('../models/follow').Service;
var ApiUtils = require('../utils/apiutils'); 
var SMS = require('../utils/sms'); 


exports.create = function(req, res) {
	
 	//req.query. for GET
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;  
	
	// Using RegEx - search is case insensitive
	UserService.findUserByUsername(username, function(err, doc) { 
		if(err) { 
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (doc){
			ApiUtils.api(req,res,ApiUtils.CLIENT_USERNAME_ALREADY_EXISTS,"Username already exists",null);
		} else{

            UserService.findUserByEmail(email, function(err, doc) {
                if(err) {
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else if (doc){
                    ApiUtils.api(req,res,ApiUtils.CLIENT_EMAIL_ALREADY_EXISTS,"Email already exists",null);
                } else{
                    var newUser = new User();
                    newUser.email = email;
                    newUser.username = username;
                    newUser.password = password;
                    newUser.save(function(err) {
                        if(!err) {
                            ApiUtils.api(req,res,ApiUtils.OK_CREATED,null,null);
                        } else {
                            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                        }
                    });

                }
            });
		}   
	});
}


exports.login = function(req, res) {

	var username = req.body.username;
	var password = req.body.password;
	
	// Using RegEx - search is case insensitive  
	UserService.findUserByUsername(username, function(err, doc) {  
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} if(!doc) {			
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_FAILED,"Invalid user or password",null);
		} else {
			doc.comparePassword(password, function(err, isMatch) {
	        	if (err){ 
	        		ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
	        	} else if(!isMatch){
	        		ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_FAILED,"Invalid user or password",null);
	        	} else{
        			doc.createToken(function(err, token) {
	        			if (err){ 
							ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
						}else{
							ApiUtils.api(req,res,ApiUtils.OK,null,token);
						}
	        		});
				}
			});
		} 
	});
}

exports.extendToken =  function(req, res) {
    var token = req.body.token;
    UserService.extendToken(token,function(err){
        if(err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else {
            ApiUtils.api(req,res,ApiUtils.OK,null,null);
        }
    });
};
exports.profile = function(req, res) {
    var fields = {
        username        :1,
        profileImageId  :1,
        following       :1,
        followers       :1
    };
    var token = req.body.token;
    var username = req.body.username;
    if(token){
        UserService.findUserByToken(token,function(err,user){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            } else if (user == null){
                ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
            } else {

                if(username == user.username){
                    //is me?
                    fields.phone = 1;
                    fields.facebookId = 1;
                    fields.email = 1;
                }
                UserService.findUserProfile(username,fields,function(err,userProfile){
                    if(err){
                        ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                    } else if (userProfile == null){
                        ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,null,null);
                    } else {
                        var isFollowingMe = false;
                        //is the user following me?
                        FollowService.findFollow(userProfile._id,user._id,function(err,follow){
                            if(err){
                                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                            }else{
                                if(follow){
                                    isFollowingMe = true;
                                }

                                userProfile.isFollowingMe = isFollowingMe;
                                //am I following the user?
                                var isFollowedByMe = false;

                                FollowService.findFollow(user._id,userProfile._id,function(err,follow) {
                                    if(err){
                                        ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                                    }else {
                                        if(follow){
                                            isFollowedByMe = true;
                                        }
                                        userProfile.isFollowedByMe = isFollowedByMe;

                                        ApiUtils.api(req, res, ApiUtils.OK, null, userProfile);
                                    }
                                });
                            }

                        });
                    }
                });
            }
        });
    } else if(username){
        UserService.findUserProfile(username,fields,function(err,userProfile){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            } else if (userProfile == null){
                ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,null,null);
            } else {
                ApiUtils.api(req,res,ApiUtils.OK,null,userProfile);
            }
        });
    } else {
        ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_BAD_REQUEST,null,null);
    }
}


exports.update = function(req, res) {
    var token = req.body.token;
    var email = req.body.email;
    var profileImageId = req.body.profileImageId;
    var facebookId = req.body.facebookId;
    UserService.findUserByToken(token,function(err,user){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        } else if (user == null){
            ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
        } else {
            if(email){
                user.email = email;
            }
            if(profileImageId){
                user.profileImageId = profileImageId;
            }
            if(facebookId){
                user.facebookId = facebookId;
            }
            user.save(function(err){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else {
                    ApiUtils.api(req,res,ApiUtils.OK,null,null);
                }
            });

        }
    });
}


exports.notifications = function(req, res) {
	var token = req.body.token;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			ApiUtils.api(req,res,ApiUtils.OK,null,user.notifications);		
		}
	});
}


exports.addPhone = function(req, res) {
	var token = req.body.token;
	var phone = req.body.phone;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			user.addPhone(phone,function(err,verficationCode){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else {
					// TODO SEND VERIFICATION CODE
					console.log("SEND code "+verficationCode+" to "+phone);
					SMS.send(phone,"Seem verification code:"+verficationCode,function(){
						ApiUtils.api(req,res,ApiUtils.OK,null,null);	
					});
				}
			});
		}
	});
}



exports.verifyPhone = function(req, res) {
	var token = req.body.token;
	var phone = req.body.phone;
	var verificationcode = req.body.verificationcode;
	
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			user.verifyPhone(phone,verificationcode,function(err,didVerified){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else {
					ApiUtils.api(req,res,ApiUtils.OK,null,didVerified);
				}
			});
		}
	});
}
