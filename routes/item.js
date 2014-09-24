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


        var promise
        if(!markId){
            promise = MarkService.create(user._id,latitude,longitude,radius,to,markName,locationName,locationAddress,mapIconId);
        } else {
            promise = Q.when(markId);
        }

        promise.then(function(markId){

            console.log("CREATE ITEM "+message+" "+mediaId+" "+templateId+" "+markId+" "+user._id);
            return ItemService.create(message,mediaId,templateId,markId,user._id);
        })
        .then(function(item){
            console.log(item);
            ApiUtils.api(req,res,ApiUtils.OK,null,{_id:item._id,shortlink:item.shortlink,markId:item.markId});
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

        ItemService.addMedia(itemId,mediaId,user._id,function(err,item){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,{_id:item._id,shortlink:item.shortlink});
            }
        });
    });
};






exports.searchByLocation = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var userLatitude = req.body.userLatitude;
        var userLongitude = req.body.userLongitude;
        var radius = req.body.radius;
        ItemService.searchByLocation(latitude,longitude,radius,userLatitude,userLongitude,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.leave = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        ItemService.leave(itemId,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.view = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.view(itemId,longitude,latitude,user._id,function(err,data){
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
        ItemService.addComment(itemId,comment,user._id,function(err){
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