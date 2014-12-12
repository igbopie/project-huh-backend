var MarkService = require('../models/mark').Service;
var ApiUtils = require('../utils/apiutils');
var Utils = require('../utils/utils');

exports.search = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        var text = req.body.text;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var userLatitude = req.body.userLatitude;
        var userLongitude = req.body.userLongitude;
        var radius = req.body.radius;
        MarkService.search(latitude,longitude,radius,text,userLatitude,userLongitude,user._id,function(err,results){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,results);
            }
        });
    });
};

exports.inRange = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        MarkService.inRange(latitude,longitude,user._id,function(err,results){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,results);
            }
        });
    });
};

exports.view = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        var markId = req.body.markId;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        MarkService.view(markId,user._id,longitude,latitude,function(err,results){
            if(err && err.code == Utils.ERROR_CODE_UNAUTHORIZED) {
                ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,err,null);
            }else if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,results);
            }
        });
    });
};


exports.favourite = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var markId = req.body.markId;
        MarkService.favourite(markId,user._id,function(err){
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
        var markId = req.body.markId;
        MarkService.unfavourite(markId,user._id,function(err){
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
        MarkService.listFavourites(longitude,latitude,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}


exports.listUserPublic = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        var username = req.body.username;
        MarkService.listUserPublic(username,longitude,latitude,user._id,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.listMyMarks = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;
        MarkService.listUserAll(user._id,longitude,latitude,function(err,data){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,data);
            }
        });
    });
}

exports.update = function(req,res){
    ApiUtils.auth(req,res,function(user) {
        var markId = req.body.markId;
        var name = req.body.name;
        var description = req.body.description;
        var locationName = req.body.locationName;
        var locationAddress = req.body.locationAddress;
        var mapIconId = req.body.mapIconId;
        MarkService.update(user._id, markId, name, description, locationName, locationAddress, mapIconId,function(err){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,null);
            }
        });
    });
}



