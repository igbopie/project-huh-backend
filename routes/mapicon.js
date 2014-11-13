var MapIconService = require('../models/mapicon').Service;
var ApiUtils = require('../utils/apiutils');


/*
 * GET users listing.
 */


exports.create = function(req, res){
    ApiUtils.auth(req,res,function(user){

        var mediaId = req.body.mediaId;
        var name = req.body.name;
        var tag = req.body.tag;
        var packId = req.body.packId;
        var pointsThreshold = req.body.pointsThreshold;
        if(user.superadmin) {
            MapIconService.create(name,tag,mediaId,packId,pointsThreshold,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template._id);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};

exports.createPack = function(req, res){
    ApiUtils.auth(req,res,function(user){

        var mediaId = req.body.mediaId;
        var name = req.body.name;
        var isFree = req.body.isFree;
        var pointsThreshold = req.body.pointsThreshold;
        var appStoreCode= req.body.appStoreCode;
        if(user.superadmin) {
            MapIconService.createPack(name,mediaId,isFree,pointsThreshold,appStoreCode,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template._id);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};

exports.update = function(req, res){
    ApiUtils.auth(req,res,function(user){

        var id = req.body.id;
        var mediaId = req.body.mediaId;
        var name = req.body.name;
        var tag = req.body.tag;
        var packId = req.body.packId;
        var pointsThreshold = req.body.pointsThreshold;
        if(user.superadmin) {
            MapIconService.update(id,name,tag,mediaId,packId,pointsThreshold,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template._id);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};

exports.updatePack = function(req, res){
    ApiUtils.auth(req,res,function(user){

        var id = req.body.id;
        var mediaId = req.body.mediaId;
        var name = req.body.name;
        var isFree = req.body.isFree;
        var pointsThreshold = req.body.pointsThreshold;
        var appStoreCode= req.body.appStoreCode;
        if(user.superadmin) {
            MapIconService.updatePack(id,name,mediaId,isFree,pointsThreshold,appStoreCode,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template._id);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};


exports.findById = function(req, res){
    ApiUtils.auth(req,res,function(user){
        var id = req.body.id;
        if(user.superadmin) {
            MapIconService.findById(id,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};

exports.findPackById = function(req, res){
    ApiUtils.auth(req,res,function(user){
        var id = req.body.id;
        if(user.superadmin) {
            MapIconService.findPackById(id,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};

exports.removeById = function(req, res){
    ApiUtils.auth(req,res,function(user){
        var id = req.body.id;
        if(user.superadmin) {
            MapIconService.removeById(id,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};

exports.removePackById = function(req, res){
    ApiUtils.auth(req,res,function(user){
        var id = req.body.id;
        if(user.superadmin) {
            MapIconService.removePackById(id,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};



exports.findIcons = function(req, res){
    var timestamp = req.body.timestamp || req.query.timestamp;

    MapIconService.find(timestamp,function(err,templates){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        }else{
            ApiUtils.api(req,res,ApiUtils.OK,null,templates);
        }
    });
};


exports.findIconPacks = function(req, res){
    var timestamp = req.body.timestamp || req.query.timestamp;

    MapIconService.findPacks(timestamp,function(err,templates){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        }else{
            ApiUtils.api(req,res,ApiUtils.OK,null,templates);
        }
    });
};

exports.findIconAndIconPacks = function(req, res){
    var timestamp = req.body.timestamp || req.query.timestamp;

    MapIconService.findPacks(timestamp,function(err,packs){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        }else{
            MapIconService.find(timestamp,function(err,icons){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                }else{
                    ApiUtils.api(req,res,ApiUtils.OK,null,{icons:icons,packs:packs});
                }
            });

        }
    });
};
