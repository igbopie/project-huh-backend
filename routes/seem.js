var Seem = require('../models/seem').Seem;
var Favourite = require('../models/seem').Favourite;
var Thumb = require('../models/seem').Thumb;
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
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItem(itemId, function (err, item) {
                    if (err) {
                        console.error(err);
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else if (!item) {
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    } else {
                        var favourited = false;
                        var thumbedUp = false;
                        var thumbedDown = false;
                        //Check if favourited
                        Favourite.findOne({"itemId":item._id,"userId":user._id},function(err,favourite) {
                            if (err) {
                                console.error(err);
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else {
                                if(favourite){
                                    favourited = true;
                                }
                                Thumb.findOne({"itemId":item._id,"userId":user._id},function(err,thumb) {
                                    if (err) {
                                        console.error(err);
                                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                                    }

                                    if (thumb && thumb.score == 1) {
                                        thumbedUp = true;
                                    } else if (thumb && thumb.score == -1) {
                                        thumbedDown = true;
                                    }

                                    item.favourited = favourited;
                                    item.thumbedDown = thumbedDown;
                                    item.thumbedUp = thumbedUp;
                                    ApiUtils.api(req, res, ApiUtils.OK, null, item);
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
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
    }



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

exports.favourite = function(req,res){
    var itemId = req.body.itemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItem(itemId, function (err, item) {
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else if (item == null) {
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    } else {

                        Favourite.findOne({"itemId":item._id,"userId":user._id},function(err,favourite) {
                            if(err){
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else if(favourite){
                                ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_ALREADY_EXISTS, err, null);
                            } else {
                                SeemService.favourite(item, user, function (err) {
                                    if (err) {
                                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                                    } else {
                                        ApiUtils.api(req, res, ApiUtils.OK, null, null);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
}

exports.unfavourite = function(req,res){
    var itemId = req.body.itemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItem(itemId, function (err, item) {
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else if (item == null) {
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    } else {
                        Favourite.findOne({"itemId":item._id,"userId":user._id},function(err,favourite) {
                            if(err){
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else if(!favourite){
                                ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, err, null);
                            } else {
                                SeemService.unfavourite(item, user, function (err) {
                                    if (err) {
                                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                                    } else {
                                        ApiUtils.api(req, res, ApiUtils.OK, null, null);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
}



exports.thumbUp = function(req,res){
    var itemId = req.body.itemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItem(itemId, function (err, item) {
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else if (item == null) {
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    } else {
                        SeemService.thumbUp(item,user,function (err) {
                            if (err) {
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else {
                                ApiUtils.api(req, res, ApiUtils.OK, null, null);
                            }

                        });
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
}


exports.thumbDown = function(req,res){
    var itemId = req.body.itemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItem(itemId, function (err, item) {
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else if (item == null) {
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    } else {
                        SeemService.thumbDown(item,user,function (err) {
                            if (err) {
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else {
                                ApiUtils.api(req, res, ApiUtils.OK, null, null);
                            }

                        });
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
}


exports.thumbClear = function(req,res){
    var itemId = req.body.itemId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItem(itemId, function (err, item) {
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else if (item == null) {
                        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
                    } else {
                        SeemService.thumbClear(item,user,function (err) {
                            if (err) {
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else {
                                ApiUtils.api(req, res, ApiUtils.OK, null, null);
                            }

                        });
                    }
                });
            }
        });
    } else {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
}
