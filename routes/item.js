var ItemService = require('../models/item').Service;
var ApiUtils = require('../utils/apiutils');
var Utils = require('../utils/utils');
var MarkService = require("../models/mark").Service;
var Q = require("q");


exports.create = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        //message,mediaId,templateId,mapIconId,latitude,longitude,radius,to,locationName,locationAddress,aliasName,aliasId,userId

        //ITEM

        var markId = req.body.markId;
        var message = req.body.message;
        var mediaId = req.body.mediaId;
        var templateId = req.body.templateId;

        //MARK
        var mapIconId = req.body.mapIconId;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var radius = req.body.radius;
        var to = req.body.to;
        var locationName = req.body.locationName;
        var locationAddress = req.body.locationAddress;
        var markName = req.body.markName;
        var markDescription = req.body.markDescription;


        var promise
        if(!markId){
            promise = MarkService.create(user._id,latitude,longitude,radius,to,markName,markDescription,locationName,locationAddress,mapIconId);
        } else {
            promise = Q.when(markId);
        }

        promise.then(function(markId){
            return ItemService.create(message,mediaId,templateId,markId,user._id);
        })
        .then(function(item){
            markId = item.markId;
            MarkService.findById(markId,function(err,mark){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else{
                    ApiUtils.api(req,res,ApiUtils.OK,null,{itemId:item._id,itemShortlink:item.shortlink,markShortlink:mark.shortlink,markId:item.markId});
                }
            });
        }).catch(function(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        }).done();


    });
};

exports.addMedia = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        //message,mediaId,templateId,mapIconId,latitude,longitude,radius,to,locationName,locationAddress,aliasName,aliasId,userId
        var itemId = req.body.itemId;
        var mediaId = req.body.mediaId;

        ItemService.addMedia(itemId,mediaId,user._id)
        .then(function(item){
            ApiUtils.api(req,res,ApiUtils.OK,null,{_id:item._id,shortlink:item.shortlink});
        }).catch(function(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        }).done();
    });
};


exports.view = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.view(itemId,longitude,latitude,user._id,function(err,data){
            if(err && err.code == Utils.ERROR_CODE_UNAUTHORIZED) {
                ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,err,null);
            }else if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}





exports.listSentToMe = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.listSentToMe(user._id,longitude,latitude,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.listSentByMe = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.listSentByMe(user._id,longitude,latitude,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.favourite = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        ItemService.favourite(itemId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
}


exports.unfavourite = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        ItemService.unfavourite(itemId,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
}

exports.listFavourites = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.listFavourites(longitude,latitude,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.listByMark = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var markId = req.body.markId;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.listByMark(markId,user._id,longitude,latitude,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.listComments = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.listComments(itemId,user._id,longitude,latitude,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.addComment = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        var comment = req.body.comment;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.addComment(itemId,comment,user._id,longitude,latitude,function(err){
            if(err && err instanceof Utils.MarkError && err.code == Utils.ERROR_CODE_UNAUTHORIZED){
                ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,err,null);
            } else if (err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
}