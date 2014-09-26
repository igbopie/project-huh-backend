var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
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
    , LOCATION_LONGITUDE = 0
    , LOCATION_LATITUDE = 1
    , STATUS = [STATUS_PENDING,STATUS_OK]
    , STATUS_PENDING = 0
    , STATUS_OK = 1
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
    , UrlShortener = require('../utils/urlshortener')
    , Q = require("q")
    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1;



var commentSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    comment :   { type: String  , required: true },
    date    :   { type: Date	, required: true, default: Date.now }
});

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
    comments    :   [commentSchema],
    //STATS
    viewCount :   { type: Number, required:true, default:0},
    favouriteCount :   { type: Number, required:true, default:0},
    commentCount :   { type: Number, required:true, default:0},
    //
    shortlink   :   { type: String, required: false}


});

itemSchema.index({userId:1,status:1});
itemSchema.index({userId:1,visibility:1,status:1});
itemSchema.index({visibility:1,status:1});
itemSchema.index({created:-1,markId:1});
itemSchema.index({status:1});


var Item = mongoose.model('Item', itemSchema);
//Dependency problem
var service = {};
module.exports = {
    Item: Item,
    Service:service
};

//
var Mark = require("../models/mark").Mark

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
var viewItemSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId  :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    lastViewed:  { type: Date, required: true, default: Date.now },
    count   :   { type: Number , required:true, default:0}
});

viewItemSchema.index({userId:1,itemId:1});
var ViewItem = mongoose.model('ViewItem', viewItemSchema);

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

    createItemGeneratePreviewImage(item)
    .then(createItemSave)
    .then(createItemShortenUrl)
    .then(createItemSave)
    .then(createItemAssignTeaserMedia)
    .then(createItemAssignMedia)
    .then(createItemCount1ItemInMark)
    .then(function(item){
            promise.resolve(item);
            createBackground(item);
    })
    .catch(function (err) {
        promise.reject(err);
    })
    .done();

    return promise.promise;
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

    Mark.findOneAndUpdate({_id:item.markId},{$inc:{itemCount:1}},function(err){
        if (err) {
            promise.reject(err);
        } else {
            promise.resolve(item);
        }
    });

    return promise.promise;
}


function createBackground(item){

    //We return to the user but we keep working on the "background"
    //Send and notify users
    if(item.to && item.status == STATUS_OK){
        EventService.onItemCreated(item);
    }
}

service.addMedia = function(itemId,mediaId,userId,callback){
    Item.findOne({_id:itemId,status:STATUS_PENDING},function(err,item){
        if(err) return callback(err);
        if(!item) return callback("Not found");
        if(!userId.equals(item.userId)) return callback("Not allowed");

        item.mediaId = mediaId;

        createProcess1(item,callback);
    });
}

service.findById = function(itemId,callback){
    Item.findOne({_id:itemId},function(err,item){
        callback(err,item);
    });
}
service.findByIdForWeb = function(itemId,callback){
    Item.findOne({_id:itemId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .exec(function(err,item){
        callback(err,item);
    });
}
service.view = function(itemId,longitude,latitude,userId,callback){
    //TODO check if private or public, if private and not in To should be able to view anything!

    Item.findOne({_id:itemId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .populate({ path: 'to', model: 'User', select: PUBLIC_USER_FIELDS })
        .populate("comments.userId",PUBLIC_USER_FIELDS)
        .exec(function(err,item){
        if(err) return callback(err);
        if(!item) return callback("Not found");

        service.allowedToSeeContent(itemId,longitude,latitude,userId,function(err,allowed){
            if(allowed){
                ViewItem.findOneAndUpdate(
                    {
                        userId:userId,
                        itemId:item._id
                    },
                    {
                        $set:{lastViewed:Date.now()},
                        $inc:{count:1}
                    },
                    {
                        upsert: true
                    },
                    function(err,view){
                        if(err) console.log(err);
                        if(view){
                            if(view.count == 1){
                                EventService.onItemViewed(itemId,userId);
                            }
                        }
                        var stat = new ViewItemStats();
                        stat.userId = userId;
                        stat.itemId = item._id;
                        stat.date = Date.now();
                        stat.save(
                            function(err) {
                                if(err) console.log(err);
                            }
                        );
                    }
                );

                Item.findOneAndUpdate(
                    {_id:item._id},
                    {$inc: { viewCount:1 }},
                    function(err,item){
                        if(err) console.log(err);

                    }
                );

                FavouriteItem.findOne({userId:userId,itemId:item._id},function(err,fav){
                    if(err) return callback(err);

                    var pItem = fillItem(item,userId);
                    pItem.message = item.message;
                    pItem.mediaId = item.mediaId,
                    pItem.renderParameters = item.renderParameters;
                    pItem.comments = item.comments.map(function(comment){
                        return {comment:comment.comment,date:comment.date,user:comment.userId};
                    });
                    pItem.canView = true;
                    pItem.favourited = (fav?true:false);

                    callback(null,pItem);
                })
            }else{
                FavouriteItem.findOne({userId:userId,itemId:item._id},function(err,fav){
                    if(err) return callback(err);

                    var pItem = service.fillItem(item,userId);
                    pItem.canView = false;
                    pItem.favourited = (fav?true:false);

                    callback(null,pItem);
                })

            }
        });
    })
}




service.listSentToMe = function(userId,longitude,latitude,callback){
    finishItemQuery(
           Item.find({to:userId,status:STATUS_OK})
               .sort({created:-1}
           )
        ,longitude,latitude,userId,callback);

}

service.listSentByMe = function(userId,longitude,latitude,callback){
    finishItemQuery(
        Item.find({userId:userId,status:STATUS_OK})
            .sort({created:-1}
        )
        ,longitude,latitude,userId,callback);
}

function inRange(item,longitude,latitude){


    if(distance(item,longitude,latitude) > item.radius){
        return false;
    }else{
        return true;
    }

}

function distance(item,longitude,latitude){
    //Check location
    //distance in meters
    var distance = Geolib.getDistance(
        {latitude: item.location[LOCATION_LATITUDE], longitude: item.location[LOCATION_LONGITUDE] },
        {latitude: latitude, longitude: longitude});
    return distance;
}

function finishItemQuery(query,longitude,latitude,userId,callback){
    query.populate("userId",PUBLIC_USER_FIELDS)
        .populate("to", PUBLIC_USER_FIELDS )
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

                        var transformedItem = service.fillItem(dbItem,userId ,longitude,latitude);
                        service.allowedToSeeContent(transformedItem._id,longitude,latitude,userId,function(err,canView){
                            if(err){
                                console.err(err);
                            } else{
                                if(canView){
                                    transformedItem.message = dbItem.message;
                                    transformedItem.mediaId = dbItem.mediaId,
                                    transformedItem.renderParameters = dbItem.renderParameters;
                                }
                                transformedItem.canView = canView;
                            }
                            FavouriteItem.findOne({userId:userId,itemId:dbItem._id},function(err,fav){
                                if(err) console.err(err);

                                transformedItem.favourited = (fav?true:false);

                                mapCallback(transformedItem);
                            });
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
service.fillItem = function(item){
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

    return publicItem;
}


service.addComment = function(itemId,comment,userId,callback) {
    Item.findOne({_id: itemId})
        .exec(function (err, item) {
            if (err) return callback(err);
            if (!item) return callback("Item not found");

            service.allowedToSeeContent(itemId,null,null,userId,function(err,canView){
                if (err) return callback(err);
                if (!canView) return callback(Utils.error(Utils.ERROR_CODE_UNAUTHORIZED,"Not allowed to post comment"));

                Item.update(
                    {_id: item},
                    {
                        $push: {comments: {userId:userId,data:Date.now(),comment:comment}},
                        $inc: {commentCount:1}
                    },
                    function (err) {
                        callback(err);
                        EventService.onCommentAdded(itemId,userId);
                    });
            })

        });
}

service.allowedToSeeContent = function(itemId,longitude,latitude,userId,callback){
    Item.findOne({_id:itemId,status:STATUS_OK},function(err,item) {
        if (err) return callback(err);
        if (!item) return callback("Entity Not Found");

        var canSee = false;
        var ownerUserId;
        var containsTo = false;

        //+++PRE PROCESS
        //Sometimes it's populated
        if (item.userId instanceof mongoose.Types.ObjectId) {
            ownerUserId = item.userId;
        } else if (item.userId) {
            ownerUserId = item.userId._id;
        }
        for (var i = 0; i < item.to.length && !containsTo; i++) {
            var toUserId = "";
            var toUserElement = item.to[i];
            console.log(toUserElement);
            if (toUserElement instanceof mongoose.Types.ObjectId) {
                toUserId = toUserElement;
            } else {
                toUserId = toUserElement._id;
            }


            if (String(toUserId) == String(userId)) {
                containsTo = true;
            }
        }
        //---

        //I am the owner or I have collected the item
        if (String(ownerUserId) == String(userId)) {
            canSee = true;
        }

        //The item is public and I am in range
        if (item.visibility == VISIBILITY_PUBLIC && longitude && latitude && inRange(item, longitude, latitude)) {
            canSee = true;
        }

        if (item.visibility == VISIBILITY_PUBLIC && item.radius == 0) {
            canSee = true;
        }

        if (item.visibility == VISIBILITY_PRIVATE && containsTo && item.radius == 0) {
            canSee = true;
        }

        if (item.visibility == VISIBILITY_PRIVATE && containsTo && longitude && latitude && inRange(item, longitude, latitude)) {
            canSee = true;
        }

        if (!canSee) {
            //Lets see if he saw once
            ViewItem.findOne({userId: userId, itemId: item._id}, 'count', function (err, doc) {
                if (err) return callback(err);
                if (!doc || doc.count == 0) return callback(null, false);

                callback(null, true);
            });
        } else {
            callback(null, true);
        }
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

                    var transformedItem = service.fillItem(dbFavItem.itemId,userId ,longitude,latitude);
                    service.allowedToSeeContent(transformedItem._id,longitude,latitude,userId,function(err,canView){
                        if(err){
                            console.err(err);
                        } else{
                            if(canView){
                                transformedItem.message = dbFavItem.itemId.message;
                                transformedItem.templateId = dbFavItem.itemId.templateId;
                                transformedItem.mediaId = dbFavItem.itemId.mediaId,
                                    transformedItem.renderParameters = dbFavItem.itemId.renderParameters;
                            }
                            transformedItem.canView = canView;
                        }
                        transformedItem.favourited = true;
                        mapCallback(transformedItem);
                    });
                }
                ,
                //Callback
                function(favs){
                    // populating user object
                    Item.populate( favs, { path: 'user', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,favs) {
                        if (err) return callback(err);
                        Item.populate( favs, { path: 'to', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,favs) {
                            if (err) return callback(err);
                            callback(null,favs);
                        });
                    });
                }
            )

    });

}

