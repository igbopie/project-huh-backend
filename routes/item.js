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
        var openability = req.body.openability;
        var to = req.body.to;

        ItemService.create(type,message,mediaId,latitude,longitude,radius,openability,to,user._id,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
};


exports.open = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var itemId = req.body.itemId;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        ItemService.open(itemId,longitude,latitude,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}