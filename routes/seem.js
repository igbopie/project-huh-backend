var Seem = require('../models/seem').Seem;
var SeemService = require('../models/seem').Service;
var UserService = require('../models/user').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function(req, res) {
    var title = req.body.title;
    var expire = req.body.expire;
    var token = req.body.token;
    console.log(req.body);
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.create(title, user, expire, function (err, seem) {
                    if (err) {
                        console.error(err);
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

exports.getSeemItems = function(req, res) {
    var page = req.body.page;
    var seemId = req.body.seemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getSeemItems(seemId, page, function (err, items) {
                    if (err) {
                        console.error(err);
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    }  else {
                        ApiUtils.api(req, res, ApiUtils.OK, null, items);
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
};



exports.add = function(req, res) {
    var caption = req.body.caption;
    var mediaId = req.body.mediaId;
    var seemId = req.body.seemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.add(seemId, caption, mediaId,user, function (err, doc) {
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


exports.findByExpire = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByExpire(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });

}

exports.findByExpired = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByExpired(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });

}