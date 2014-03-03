var Media = require('../models/media').Media;
var ApiUtils = require('../utils/apiutils');
var AWS = require('aws-sdk');
var UserService = require('../models/user').Service;
var MediaService = require('../models/media').Service;
var fs = require('fs');
var s3 = new AWS.S3();
var s3Bucket = 'seem-dev-test';

exports.create = function(req, res){
	
	var token = req.body.token;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
            var media = new Media();
            media.ownerId = user._id;
            media.contentType = req.files.file.type;
            media.size = req.files.file.size;
            media.name = req.files.file.name;
            //TODO
            media.originalURL = "NOT IMPLEMENTED";
            media.largeURL = "NOT IMPLEMENTED";
            media.thumbURL = "NOT IMPLEMENTED";
            media.location = "NOT IMPLEMENTED";
            media.dimensions = "NOT IMPLEMENTED";

            media.save(function(err){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else {

                    var bodyStream = fs.createReadStream(req.files.file.path);

                    var params = {
                        Bucket          : s3Bucket,
                        Key             : ""+media._id+"_"+media.name,
                        Body          : bodyStream,
                        ContentType: media.contentType
                    };

                    s3.putObject(params, function(err, data) {
                        if(err){
                            //TODO remove image from db
                            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                        } else{
                            //there's an e-tag but I am not going to do anything with it.
                            ApiUtils.api(req,res,ApiUtils.OK,null,null);
                        }

                    });
                }
            });

		}
	})
};


exports.remove = function(req, res){
	
	var token = req.body.token;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			//TODO
		}
	})
};


exports.get = function(req, res){
	var token = req.body.token;
    var imageId = req.body.imageId;
	UserService.findUserByToken(token,function(err,user){
		if(err){
			ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
		} else if (user == null){
			ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
		} else {
			//TODO
            MediaService.findMediaById(imageId,function(err,media){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else if (media == null){
                    ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,null,null);
                } else {
                    var params = {Bucket: s3Bucket, Key: imageId+"_"+media.name};
                    res.writeHead(200, {
                        'Content-Length': media.size,
                        'Content-Type':  media.contentType});
                    s3.getObject(params).
                        on('httpData', function(chunk) { res.write(chunk); }).
                        on('httpDone', function() { res.end(); }).
                        send();
                }
            });
			
		}
	})
};
