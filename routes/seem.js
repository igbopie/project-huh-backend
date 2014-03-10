var Seem = require('../models/seem').Seem;
var SeemService = require('../models/seem').Service;
var ApiUtils = require('../utils/apiutils');
var UserService = require('../models/user').Service;

exports.create = function(req, res) {
    var token = req.body.token;
    var caption = req.body.caption;
    var mediaId = req.body.mediaId;
    UserService.findUserByToken(token,function(err,user){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        } else if (user == null){
            ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
        } else {
            SeemService.create(user,caption,mediaId,function(err,seem){
                if(err){
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else {
                    ApiUtils.api(req,res,ApiUtils.OK,null,seem._id);
                }
            });
        }
    });
};
exports.get = function(req, res) {
    var token = req.body.token;
    var seemId = req.body.seemId;
    UserService.findUserByToken(token,function(err,user){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        } else if (user == null){
            ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
        } else {
            SeemService.findById(seemId,function(err,seem){
                if(err){
                    console.error(err);
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else {
                    //TODO CHECK ownership and visibility
                    ApiUtils.api(req,res,ApiUtils.OK,null,seem);
                }
            });
        }
    });
};

exports.reply = function(req, res) {
    var token = req.body.token;
    var caption = req.body.caption;
    var mediaId = req.body.mediaId;
    var seemId = req.body.seemId;
    UserService.findUserByToken(token,function(err,user){
        if(err){
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        } else if (user == null){
            ApiUtils.api(req,res,ApiUtils.CLIENT_LOGIN_TIMEOUT,null,null);
        } else {
            SeemService.findById(seemId,function(err,seem){
                if(err){
                    console.error(err);
                    ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
                } else if(!seem){
                    ApiUtils.api(req,res,ApiUtils.CLIENT_ENTITY_NOT_FOUND,err,null);
                } else {

                }
            });

        }
    });
};
exports.search = function(req, res) {

};
exports.myseems = function(req, res) {

};

