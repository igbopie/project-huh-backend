var NOTIFICATION_TYPES = require('../models/user').NOTIFICATION_TYPES;
var UserService = require('../models/user').Service;
var FeedService = require('../models/feed').Service;
var ApiUtils = require('../utils/apiutils'); 


/*
 * GET users listing.
 */

exports.findByMyFeed = function(req, res){
	
	var token = req.body.token;
	var page = req.body.page;
    if(!page){
        page = 0;
    }
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
            FeedService.findByMyFeed(user,page,function(err,docs){
				if(err){
					ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
				} else{
					ApiUtils.api(req,res,ApiUtils.OK,null,docs);
				}
				
			});
		}
	})
};

