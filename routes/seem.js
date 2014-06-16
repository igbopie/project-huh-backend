var Seem = require('../models/seem').Seem;
var SeemService = require('../models/seem').Service;
var UserService = require('../models/user').Service;
var SeemLib = require('../models/seem');
var ApiUtils = require('../utils/apiutils');

exports.create = function(req, res) {
    var title = req.body.title;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var coverPhotoMediaId = req.body.coverPhotoMediaId;
    var publishPermissions = req.body.publishPermissions;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.create(title, user, startDate,endDate,coverPhotoMediaId,publishPermissions, function (err, seem) {
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
    var replyTo = req.body.replyTo;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.add(seemId, caption, mediaId,replyTo,user, function (err, doc) {
                    if(err && err instanceof SeemLib.EndedSeemError){
                        ApiUtils.api(req, res, ApiUtils.CLIENT_SEEM_ENDED, err, null);
                    } else if(err && err instanceof SeemLib.NotStartedSeemError){
                        ApiUtils.api(req, res, ApiUtils.CLIENT_SEEM_NOT_STARTED, err, null);
                    } else if(err && err instanceof SeemLib.InvalidPermissions){
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, err, null);
                    } else if (err) {
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


exports.findByUpdated = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByUpdated(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });

}

exports.findByAboutToStart = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByAboutToStart(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });

}

exports.findByAboutToEnd = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByAboutToEnd(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });

}

exports.findByEnded = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByEnded(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });

}