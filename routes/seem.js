var Seem = require('../models/seem').Seem;
var SeemService = require('../models/seem').Service;
var UserService = require('../models/user').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function(req, res) {
    var caption = req.body.caption;
    var mediaId = req.body.mediaId;
    var title = req.body.title;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.create(title, caption, mediaId, user, function (err, seem) {
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else {
                        ApiUtils.api(req, res, ApiUtils.OK, null, seem);
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
};

exports.getItem = function(req, res) {
    var itemId = req.body.itemId;


    SeemService.getItem(itemId, function (err, item) {
        if (err) {
            console.error(err);
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else if (!item) {
            ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
        } else {
            ApiUtils.api(req, res, ApiUtils.OK, null, item);
        }
    });

};

exports.getItemReplies = function(req, res) {
    var itemId = req.body.itemId;
    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.getItemReplies(itemId,page,function(err,item){
        if(err){
            console.error(err);
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        } else {
            ApiUtils.api(req,res,ApiUtils.OK,null,item);
        }
    });
};

exports.reply = function(req, res) {
    var caption = req.body.caption;
    var mediaId = req.body.mediaId;
    var itemId = req.body.itemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.reply(itemId, caption, mediaId,user, function (err, doc) {
                    if (err) {
                        console.error(err);
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else {
                        ApiUtils.api(req, res, ApiUtils.OK, null, doc);
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }

};
exports.list = function(req, res) {
    SeemService.list(function(err,docs){
        if(err){
            console.error(err);
            ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
        } else{
            ApiUtils.api(req,res,ApiUtils.OK,null,docs);
        }
    });
};


