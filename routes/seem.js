var Seem = require('../models/seem').Seem;
var Action = require('../models/seem').Action;
var SeemService = require('../models/seem').Service;
var UserService = require('../models/user').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function(req, res) {
    var caption = req.body.caption;
    var mediaId = req.body.mediaId;
    var title = req.body.title;
    var topicId = req.body.topicId;
    var token = req.body.token;
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.create(title, caption, mediaId, topicId, user, function (err, seem) {
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
                        SeemService.fillActionInfo(item,user,function(err,item){
                            if(err) return callback(err,null);
                            ApiUtils.api(req, res, ApiUtils.OK, null, item);
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
    var token = req.body.token;
    if(!page){
        page = 0;
    }
    if(!token) {
        SeemService.getItemReplies(itemId, page, function (err, item) {
            if (err) {
                console.error(err);
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else {
                ApiUtils.api(req, res, ApiUtils.OK, null, item);
            }
        });
    } else {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                SeemService.getItemRepliesWithFavourited(itemId,page,user,function(err,docs){
                    if (err) {
                        console.error(err);
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    } else {
                        ApiUtils.api(req, res, ApiUtils.OK, null, docs);
                    }
                });
            }
        });
    }
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
// DEPRECATED!!
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


exports.listTopics = function(req, res) {
    SeemService.listTopics(function(err,docs){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else {
            ApiUtils.api(req, res, ApiUtils.OK, null, docs);
        }
    });

}

exports.search = function (req,res){

    var text = req.body.text;
    if(text){
        var retObj = {};
        SeemService.searchSeem(text,function(err,results){
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            }else{
                retObj.seems = results;

                SeemService.searchItems(text,function(err,results){
                    if (err) {
                        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                    }else{

                        retObj.replies = results;

                        UserService.search(text,function(err,results) {
                            if (err) {
                                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                            } else {
                                retObj.users = results;

                                ApiUtils.api(req, res, ApiUtils.OK, null, retObj);

                            }
                        });
                    }
                });

            }
        });
    }else{
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_BAD_REQUEST, null, null);
    }
}


exports.findByTopic = function (req,res){

    var topicId = req.body.topicId;
    var page = req.body.page;
    if(!page){
        page = 0;
    }
    if(!topicId){
        ApiUtils.api(req, res, ApiUtils.CLIENT_ERROR_BAD_REQUEST, null, null);
    }else{
        SeemService.findByTopic(topicId,page,function(err,seems){
            if (err) {
                ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            }else{
                ApiUtils.api(req, res, ApiUtils.OK, null, seems);
            }
        });
    }

}

exports.findByHotness = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByHotness(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });
}

exports.findByViral = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByViral(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });
}

exports.findByCreated = function (req,res){
    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findByCreated(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });
}

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

exports.findFavouritedByUser = function(req,res) {
    var username = req.body.username;
    var page = req.body.page;
    if (!page) {
        page = 0;
    }
    UserService.findUserByUsername(username, function (err, user) {
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else if(!user){
            ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, err, null);
        }else{
            SeemService.findFavouritedByUser(user,page,function(err,docs){
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, docs);
                }
            });

        }
    });
}


exports.findItemsByHotness = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findItemsByHotness(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });
}

exports.findItemsByViral = function (req,res){

    var page = req.body.page;
    if(!page){
        page = 0;
    }
    SeemService.findItemsByViral(page,function(err,seems){
        if (err) {
            ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        }else{
            ApiUtils.api(req, res, ApiUtils.OK, null, seems);
        }
    });
}
