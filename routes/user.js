
var User = require('../models/user').User; 
var UserService = require('../models/user').Service; 
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
			ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_ALREADY_EXISTS,"User already exists",null);
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
