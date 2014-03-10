var Media = require('../models/media').Media;
var ApiUtils = require('../utils/apiutils');
var UserService = require('../models/user').Service;
var MediaService = require('../models/media').Service;
var fs = require('fs');

exports.create = function(req, res){
	
	var token = req.body.token;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
            MediaService.create(
                    req.files.file.path,
                    req.files.file.type,
                    req.files.file.name,
                    user._id,
                function(err,imageId){
                    if(err){
                        console.error("There was an error creating an image:");
                        console.error(err);
                        ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                    }else{
                        ApiUtils.api(req,res,ApiUtils.OK,null,imageId);
                    }
            });
		}
	})
};


exports.remove = function(req, res){
	
	var token = req.body.token;
    var imageId = req.body.imageId;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
            MediaService.findById(imageId,function(err,media){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else if (media == null){
                    ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,null,null);
                } else {
                    if(media.ownerId != (user._id+"")){
                        ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
                    } else {
                        MediaService.remove(media,function(err){
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
};


exports.get = function(req, res){
	var token = req.body.token;
    var imageId = req.body.imageId;
    var formatName = req.body.format;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
            MediaService.findById(imageId,function(err,media){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else if (media == null){
                    ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,null,null);
                } else {
                    if(media.ownerId != (user._id+"")){
                        ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
                    } else {
                        MediaService.get(media,formatName,function(err,media){
                            if(err){
                                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                            } else {
                                var stat = fs.statSync(media.tempPath);
                                res.writeHead(200, {
                                    'Content-Type' : media.contentType,
                                    'Content-Length': stat.size
                                });

                                var file = fs.createReadStream(media.tempPath);
                                file.pipe(res);

                            }
                        });
                    }
                }
            });
		}
	})
};
