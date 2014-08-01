var Media = require('../models/media').Media;
var ApiUtils = require('../utils/apiutils');
var UserService = require('../models/user').Service;
var Item = require('../models/item').Item;
var ItemModel = require('../models/item');
var MediaService = require('../models/media').Service;
var MediaVars = require('../models/media');
var fs = require('fs');

exports.create = function(req, res){
    ApiUtils.auth(req,res,function(user){
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
    });
};


exports.remove = function(req, res){
    ApiUtils.auth(req,res,function(user){
    var imageId = req.body.imageId;
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
	})
};


exports.get = function(req, res){
    ApiUtils.auth(req,res,function(user) {
        var imageId = req.params.id;
        var formatName = req.params.format;
        console.log("ID:" + imageId + " Format:" + formatName);
        MediaService.findById(imageId, function (err, media) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (media == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
            } else if(media.uploadStatus != MediaVars.UPLOAD_STATUSES_ASSIGNED){
                ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_BAD_REQUEST, null, null);
            } else {
                //Check permissions
                var authorized = false;
                if(media.visibility == MediaService.VISIBILITY_PUBLIC){
                    authorized = true;
                } else if(media.ownerId == (user._id+"")) {
                    authorized = true;
                } else {
                    //check list
                    for (var index = 0; index < media.canView.length; ++index) {
                        if(media.canView[index] == (user._id+"")) {
                            authorized = true;
                            break;
                        }
                    }
                }

                if(!authorized) {
                    ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
                } else {
                    MediaService.get(media, formatName, function (err, media) {
                        if (err) {
                            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                        } else {
                            var stat = fs.statSync(media.tempPath);
                            res.writeHead(200, {
                                'Content-Type': media.contentType,
                                'Content-Length': stat.size
                            });

                            var file = fs.createReadStream(media.tempPath);
                            file.pipe(res);

                        }
                    });
                }
            }
        });
    });
};



exports.preview = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.params.itemId;
        Item.findOne({_id:itemId},function(err,item){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else if(!item){
                ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,null,null);
            }else{
                var show = false;
                if(item.visibility == ItemModel.VISIBILITY_PUBLIC){
                    show = true;
                }

                if(String(item.ownerUserId)  == String(user._id) ){
                    show = true;
                }
                for (var i = 0; i < item.to.length && !show; i++) {
                    if (String(item.to[i]) == String(user._id)) {
                        show = true;
                    }
                }

                if(!show){
                    return ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
                }

                if(!item.mediaId){
                    return ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_BAD_REQUEST,null,null);
                }

                MediaService.findById(item.mediaId, function (err, media) {
                    if(err){
                        ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                    }else if(!media) {
                        return ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    }
                    MediaService.blur(media, function (err, media) {
                        if (err) {
                            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                        } else {
                            var stat = fs.statSync(media.tempPath);
                            res.writeHead(200, {
                                'Content-Type': media.contentType,
                                'Content-Length': stat.size
                            });

                            var file = fs.createReadStream(media.tempPath);
                            file.pipe(res);

                        }
                    });

                });
            }
        });
    });
}