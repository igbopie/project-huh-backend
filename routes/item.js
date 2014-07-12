var ItemService = require('../models/item').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        var type = req.body.type;
        var message = req.body.message;
        var mediaId = req.body.mediaId;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var radius = req.body.radius;
        var to = req.body.to;
        var title = req.body.title;

        ItemService.create(type,title,message,mediaId,latitude,longitude,radius,to,user._id,function(err,item){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,item._id);
            }
        });
    });
};


exports.collect = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.collect(itemId,longitude,latitude,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}




exports.searchByLocation = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var radius = req.body.radius;
        ItemService.searchByLocation(latitude,longitude,radius,user._id,function(err,data){
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
        ItemService.view(itemId,user._id,function(err,data){
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

exports.listCollected = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        ItemService.listCollected(user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}