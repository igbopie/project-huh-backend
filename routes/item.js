var ItemService = require('../models/item').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        //message,mediaId,templateId,mapIconId,latitude,longitude,radius,to,locationName,locationAddress,aliasName,aliasId,userId
        var message = req.body.message;
        var mediaId = req.body.mediaId;
        var templateId = req.body.templateId;
        var mapIconId = req.body.mapIconId;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var radius = req.body.radius;
        var to = req.body.to;
        var locationName = req.body.locationName;
        var locationAddress = req.body.locationAddress;
        var aliasName = req.body.aliasName;
        var aliasId = req.body.aliasId;

        ItemService.create(message,mediaId,templateId, mapIconId,latitude,longitude,radius,to,locationName,locationAddress,aliasName,aliasId,user._id,function(err,item){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,item._id);
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
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
}


exports.listSentToMe = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        ItemService.listSentToMe(user._id,function(err,data){
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
        ItemService.listSentByMe(user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}