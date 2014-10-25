var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , LOCATION_LONGITUDE = 0
    , LOCATION_LATITUDE = 1
    , STATUS = [STATUS_PENDING,STATUS_OK]
    , STATUS_PENDING = 0
    , STATUS_OK = 1
    , NUM_MARK_ITEM_CACHE = 1;



var itemSchema = new Schema({
    userId      :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    created     :   { type: Date	, required: true, default: Date.now },
    templateId  :   { type: Schema.Types.ObjectId, required: false},
    // Private fields (not viewed)
    message     :   { type: String, required: false},
    mediaId     :   { type: Schema.Types.ObjectId, required: false},
    // A pre rendered image of the message
    teaserMediaId:   { type: Schema.Types.ObjectId, required: false},
    teaserMessage:   { type: String, required: false},
    //Additional parameters
    renderParameters   :   { type: String, required: false},
    //
    markId     :   { type: Schema.Types.ObjectId, required: true, ref:"Mark"},
    status      :   { type: Number, enum: STATUS,required:true, default:STATUS_PENDING },
    //STATS
    viewCount :   { type: Number, required:true, default:0},
    favouriteCount :   { type: Number, required:true, default:0},
    commentCount :   { type: Number, required:true, default:0},
    //
    shortlink   :   { type: String, required: false}


});

itemSchema.index({markId:1,created:-1});
itemSchema.index({userId:1,status:1});
itemSchema.index({userId:1,visibility:1,status:1});
itemSchema.index({visibility:1,status:1});
itemSchema.index({created:-1,markId:1});
itemSchema.index({status:1});


var Item = mongoose.model('Item', itemSchema);

var commentSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId  :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    comment :   { type: String  , required: true },
    date    :   { type: Date	, required: true, default: Date.now }
});

itemSchema.index({itemId:1,date:-1});

var Comment = mongoose.model('Comment', commentSchema);

//Dependency problem
var service = {};
module.exports = {
    Item: Item,
    Comment: Comment,
    Service:service
};


var UserService = require("../models/user").Service
    , Media = require("../models/media").Media
    , MediaService = require("../models/media").Service
    , MediaVars = require('../models/media')
    , FriendService = require("../models/friend").Service
    , TemplateService = require("../models/template").Service
    , MapIconService = require("../models/mapicon").Service
    , EventService = require("../models/eventdispatcher").Service
    , ItemUtils = require('../utils/itemhelper')
    , Geolib = require('geolib')
    , Utils = require('../utils/utils')
    , textSearch = require('mongoose-text-search')
    , CronJob = require('cron').CronJob
    , CONSTANT_DATE = 1377966600  // is a constant and a very special date :)
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
    , UrlShortener = require('../utils/urlshortener')
    , Q = require("q")
    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1
    , Mark = require("../models/mark").Mark
    , FavouriteMark  = require("../models/mark").FavouriteMark
    , MarkService  = require("../models/mark").Service

///------------------------
///------------------------
///------------------------
var favouriteItemSchema = new Schema({
    userId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    date: { type: Date	, required: true, default: Date.now }
});

favouriteItemSchema.index({userId:1,date:-1});
favouriteItemSchema.index({userId:1,itemId:1},{unique:true});

var FavouriteItem = mongoose.model('FavouriteItem', favouriteItemSchema);
///------------------------
///------------------------
///------------------------

var viewItemStatsSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId  :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    date:  { type: Date, required: true, default: Date.now }
});

var ViewItemStats = mongoose.model('ViewItemStats', viewItemStatsSchema);

///------------------------
///------------------------
///------------------------
//          Service
///------------------------
///------------------------
///------------------------


service.create = function(message,mediaId,templateId,markId,userId){
    var promise = Q.defer();

    var item = new Item();
    item.message = message;
    if(mediaId){
        item.mediaId = mediaId;
    }
    if(templateId){
        item.templateId = templateId;
    }

    item.userId = userId;
    item.markId = markId;


    //TODO check owner exists!
    //TODO check templateId
    createProcess(promise,item);

    return promise.promise;
}

function createProcess(promise,item){
    createItemGeneratePreviewImage(item)
        .then(createItemSave)
        .then(createItemShortenUrl)
        .then(createItemSave)
        .then(createItemAssignTeaserMedia)
        .then(createItemAssignMedia)
        .then(createItemCount1ItemInMark)
        .then(UserService.addPostHandler)
        .then(function(item){
            promise.resolve(item);
            createBackground(item);
        })
        .catch(function (err) {
            promise.reject(err);
        })
        .done();
}



function createItemGeneratePreviewImage(item){
    var promise = Q.defer();

    ItemUtils.generatePreviewImage(item,function(err,item){
        if(err) {
            promise.reject(err);
        } else {
            promise.resolve(item);
        }
    });

    return promise.promise;
}

function createItemSave(item) {
    var promise = Q.defer();

    if (item.mediaId) {
        item.status = STATUS_OK;
    }
    item.save(function (err) {
        if(err) {
            promise.reject(err);
        } else {
            promise.resolve(item);
        }
    });

    return promise.promise;
}

function createItemShortenUrl(item) {
    var promise = Q.defer();

    UrlShortener.shortenItem(item._id, function (err, shortlink) {
        if (err) {
            promise.reject(err);
        } else {
            if(shortlink){
                item.shortlink = shortlink;
            }
            promise.resolve(item);
        }
    })

    return promise.promise;

}
//Save Again
function createItemAssignTeaserMedia(item) {
    var promise = Q.defer();

    if (item.teaserMediaId && !item.templateId) {
        MediaService.assign(item.teaserMediaId, [], MediaVars.VISIBILITY_PUBLIC, item._id, "Item#teaserMediaId", function (err) {
            if (err) {
                promise.reject(err);
            } else {
                promise.resolve(item);
            }
        });
    } else {
        promise.resolve(item);
    }

    return promise.promise;
}


function createItemAssignMedia(item) {
    var promise = Q.defer();

    if (item.mediaId && !item.templateId) {

        Mark.findOne({_id:item.markId},function(err,mark){
            if (err) {
                promise.reject(err);
            }else {
                var visibility = MediaVars.VISIBILITY_PRIVATE;
                if (mark.visibility == VISIBILITY_PUBLIC) { //See mark!
                    visibility = MediaVars.VISIBILITY_PUBLIC;
                }
                MediaService.assign(item.mediaId, mark.to, visibility, item._id, "Item#mediaId", function (err) {
                    if (err) {
                        promise.reject(err);
                    } else {
                        promise.resolve(item);
                    }
                });
            }
        });
    } else {
        promise.resolve(item);
    }

    return promise.promise;
}

function createItemCount1ItemInMark(item) {
    var promise = Q.defer();

    if (item.status == STATUS_OK) {
        Mark.findOneAndUpdate(
            {_id: item.markId},
            {
                $inc: {itemCount: 1},
                $set: {
                    updated: Date.now()
                }
                /*$push: {
                 items: {
                 $each: [JSON.parse(JSON.stringify(item))], //a mongoose object has problems...
                 $slice: NUM_MARK_ITEM_CACHE
                 }
                 }*/
            },
            function (err) {
                if (err) {
                    promise.reject(err);
                } else {
                    promise.resolve(item);
                }
            }
        );
    }else{
        promise.resolve(item);
    }

    return promise.promise;
}


function createBackground(item){

    //We return to the user but we keep working on the "background"
    //Send and notify users
    if(item.to && item.status == STATUS_OK){
        EventService.onItemCreated(item);
    }
}

service.addMedia = function(itemId,mediaId,userId){
    var promise = Q.defer();
    Item.findOne({_id:itemId,status:STATUS_PENDING},function(err,item){
        if(err) return callback(err);
        if(!item) return callback("Not found");
        if(!userId.equals(item.userId)) return callback("Not allowed");

        item.mediaId = mediaId;

        createProcess(promise,item);
    });
    return promise.promise;
}

service.findById = function(itemId,callback){
    Item.findOne({_id:itemId},function(err,item){
        callback(err,item);
    });
}
service.findByIdForWeb = function(itemId,callback){
    Item.findOne({_id:itemId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .populate("markId")
        .exec(function(err,item){
        callback(err,item);
    });
}
service.view = function(itemId,longitude,latitude,userId,callback){
    //TODO check if private or public, if private and not in To should be able to view anything!

    Item.findOne({_id:itemId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .populate({ path: 'to', model: 'User', select: PUBLIC_USER_FIELDS })
        .exec(function(err,item){
        if(err) return callback(err);
        if(!item) return callback("Not found");

        service.allowedToSeeContent(itemId,longitude,latitude,userId,function(err,canView){
            if(err) return callback(err);

            if(canView) {
                var stat = new ViewItemStats();
                stat.userId = userId;
                stat.itemId = item._id;
                stat.date = Date.now();
                stat.save(
                    function (err) {
                        if (err) console.log(err);
                    }
                );

                Item.findOneAndUpdate(
                    {_id: item._id},
                    {$inc: { viewCount: 1 }},
                    function (err, item) {
                        if (err) console.log(err);

                    }
                );
            }
            service.fillItem(item,longitude,latitude,userId,callback);

        })
    });
}



service.public = function(userId,longitude,latitude,callback){
    FavouriteMark.find({userId:userId},function(err,list){
        if(err) return callback(err);
        var markIdsArray = [];
        for(var i = 0; i < list.length; i++){
            markIdsArray.push(list[i].markId);
        }

        finishItemQuery(
            Item.find({markId:{ $in:markIdsArray},status:STATUS_OK})
                .sort({created:-1}
            )
            ,longitude,latitude,userId,callback);
    });
}
service.private = function(userId,longitude,latitude,callback){
    Mark.find({members:userId,userId:{$ne:userId}},function(err,list){
        if(err) return callback(err);
        var markIdsArray = [];
        for(var i = 0; i < list.length; i++){
            markIdsArray.push(list[i]._id);
        }

        finishItemQuery(
            Item.find({markId:{ $in:markIdsArray},status:STATUS_OK})
                .sort({created:-1}
            )
            ,longitude,latitude,userId,callback);
    });



}

service.sent = function(userId,longitude,latitude,callback){
    finishItemQuery(
        Item.find({userId:userId,status:STATUS_OK})
            .sort({created:-1}
        )
        ,longitude,latitude,userId,callback);
}

function finishItemQuery(query,longitude,latitude,userId,callback){
    query.populate("userId",PUBLIC_USER_FIELDS)
        .exec(function(err,item){
            if(err) return callback(err);
            if(!item) return callback("Item not found");

            if(item instanceof Item) {
                var publicItem = service.fillItem(item, userId,longitude,latitude);
                if (publicItem) {
                    return callback(null, publicItem);
                } else {
                    return callback("Not permitted");
                }
            }else{
                Utils.map(
                    item,
                    //Map Function
                    function(dbItem,mapCallback){

                        service.fillItem(dbItem,longitude,latitude,userId,function(err,item){
                            if(err){
                                console.err(err);
                            }
                            mapCallback(item);
                        });

                    }
                    ,
                    //Callback
                    function(results){
                        callback(null, results);
                    }
                )
            }

        });
}

service.fillItem = function(item,longitude,latitude,userId,callback){
    var publicItem = {_id:item._id};
    publicItem.user = item.userId;
    publicItem.created = item.created;
    publicItem.viewCount = item.viewCount;
    publicItem.favouriteCount = item.favouriteCount;
    publicItem.commentCount = item.commentCount;
    publicItem.shortlink = item.shortlink;

    publicItem.teaserMediaId = item.teaserMediaId;
    publicItem.teaserMessage = item.teaserMessage;
    publicItem.renderParameters = item.renderParameters;
    publicItem.templateId = item.templateId;
    publicItem.canView = false;


    service.allowedToSeeContent(item._id,longitude,latitude,userId,function(err,canView) {
        if (err) return callback(err);

        if (canView) {
            publicItem.message = item.message;
            publicItem.mediaId = item.mediaId,
                publicItem.renderParameters = item.renderParameters;
            publicItem.canView = canView;
        }

        FavouriteItem.findOne({userId: userId, itemId: item._id}, function (err, fav) {
            if (err) return callback(err);

            publicItem.favourited = (fav ? true : false);

            callback(null, publicItem);
        });
    });
}

service.listComments = function(itemId,userId,longitude,latitude,callback){

    service.allowedToSeeContent(itemId,longitude,latitude,userId,function(err,canView) {
        if (err) return callback(err);
        if (!canView) return callback(Utils.error(Utils.ERROR_CODE_UNAUTHORIZED, "Not allowed to view comment"));

        Comment.find({itemId: itemId})
            .sort({date: -1})
            .populate("userId", PUBLIC_USER_FIELDS)
            .exec(function (err, comments) {
                if (err) return callback(err);
                comments = comments.map(function (comment) {
                    return {comment: comment.comment, date: comment.date, user: comment.userId};
                });
                callback(null, comments);
            });
    });
}
service.addComment = function(itemId,textComment,userId,longitude,latitude,callback) {
    Item.findOne({_id: itemId})
        .exec(function (err, item) {
            if (err) return callback(err);
            if (!item) return callback("Item not found");

            service.allowedToSeeContent(itemId,longitude,latitude,userId,function(err,canView){
                if (err) return callback(err);
                if (!canView) return callback(Utils.error(Utils.ERROR_CODE_UNAUTHORIZED,"Not allowed to post comment"));

                var comment = new Comment();

                comment.userId = userId;
                comment.itemId = itemId;
                comment.comment= textComment;
                comment.save(function(err){
                    if(err) return callback(err);
                    Item.update(
                        {_id: item},
                        {
                            $inc: {commentCount:1}
                        },
                        function (err) {
                            callback(err);
                            EventService.onCommentAdded(itemId,userId);
                        });
                });

            })

        });
}

service.favourite = function(itemId,userId,callback){

    var fav = new FavouriteItem();
    fav.itemId = itemId;
    fav.userId = userId;

    fav.save(function(err){
        //Already favourited
        if(err && err.code == 11000) return callback();

        if(err) return callback(err);

        Item.update({_id:itemId},{$inc:{favouriteCount:1}},function(err){
            if(err) return callback(err);
            callback();
        });
    });
}


service.unfavourite = function(itemId,userId,callback){

    FavouriteItem.findOne({userId:userId,itemId:itemId},function(err,favDoc){
        if(err) return callback(err);
        if(!favDoc) return callback("Not Favourited");

        favDoc.remove(function(err){
            if(err) return callback(err);

            Item.update({_id:itemId},{$inc:{favouriteCount:-1}},function(err){
                if(err) return callback(err);
                callback();
            });
        });
    });

}

service.listFavourites = function(longitude,latitude,userId,callback){

    FavouriteItem.find({userId:userId})
        .populate("itemId")
        .exec(function(err,favs){
            if(err) return callback(err);

            Utils.map(
                favs,
                //Map Function
                function(dbFavItem,mapCallback){
                    service.fillItem(dbFavItem.itemId ,longitude,latitude,userId,function(err,item){
                        if(err){
                            console.err(err);
                        }
                        mapCallback(item);
                    });
                }
                ,
                //Callback
                function(favs){
                    // populating user object
                    Item.populate( favs, { path: 'user', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,favs) {
                        if (err) return callback(err);

                        callback(null,favs);

                    });
                }
            )

    });

}


service.listByMark = function(markId,userId,longitude,latitude,callback){

    Item.find({markId:markId,status:STATUS_OK}).sort({created:-1})
        .populate({ path: 'userId', model: 'User', select: PUBLIC_USER_FIELDS })
        .populate({ path: 'to', model: 'User', select: PUBLIC_USER_FIELDS })
        .exec(function(err,items){
            if(err) return callback(err);

            Utils.map(
                items,
                //Map Function
                function(dbItem,mapCallback){

                    service.fillItem(dbItem,longitude,latitude,userId,function(err,item){
                        if(err){
                            console.error(err);
                        }
                        mapCallback(item);
                    });
                }
                ,
                //Callback
                function(items){
                    if (err) return callback(err);
                    callback(null,items);
                });
        });

}


service.allowedToSeeContent = function(itemId,longitude,latidude,userId,callback){
    Item.findOne({_id:itemId},function(err,item){
        if(err) return callback(err);
        if(!item) return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND,"Not found"));

        MarkService.canViewMark(item.markId,userId,longitude,latidude,function(err,permissions){
            if(err) return callback(err);

            var canView = permissions.canView || permissions.lastViewed > item.created;
            callback(null,canView);

        });

    })

}


