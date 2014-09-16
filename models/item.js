var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
    , Media = require("../models/media").Media
    , MediaService = require("../models/media").Service
    , MediaVars = require('../models/media')
    , AliasService = require("../models/alias").Service
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
    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1
    , VISIBILITY = [VISIBILITY_PRIVATE,VISIBILITY_PUBLIC]
    , LOCATION_LONGITUDE = 0
    , LOCATION_LATITUDE = 1
    , STATUS = [STATUS_PENDING,STATUS_OK]
    , STATUS_PENDING = 0
    , STATUS_OK = 1
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
    , BITLY_USERNAME = process.env.BITLY_USERNAME
    , BITLY_TOKEN = process.env.BITLY_TOKEN
    , BITLY_DOMAIN = process.env.BITLY_DOMAIN
    , BITLY_DOMAIN_ITEM_REDIRECT = process.env.BITLY_DOMAIN_ITEM_REDIRECT
    , Bitly = require('bitly')
;
var bitly;
if(BITLY_TOKEN){
    bitly = new Bitly(BITLY_USERNAME,BITLY_TOKEN);
    console.log("BITLY initialized");
}



var commentSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    comment :   { type: String  , required: true },
    date    :   { type: Date	, required: true, default: Date.now }
});

var itemSchema = new Schema({
    userId      :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    created     :   { type: Date	, required: true, default: Date.now },
    //++ Private fields (not viewed)
    message     :   { type: String, required: false},
    templateId  :   { type: Schema.Types.ObjectId, required: false},
    templateMediaId:   { type: Schema.Types.ObjectId, required: false},
    mediaId     :   { type: Schema.Types.ObjectId, required: false},
    //--
    // A pre rendered image of the message
    teaserMediaId:   { type: Schema.Types.ObjectId, required: false},
    teaserTemplateMediaId:   { type: Schema.Types.ObjectId, required: false},
    teaserMessage:   { type: String, required: false},
    mapIconId   :   { type: Schema.Types.ObjectId, required: false},
    mapIconMediaId   :   { type: Schema.Types.ObjectId, required: false},
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true},
    locationName:   { type: String, required: false},
    locationAddress:   { type: String, required: false},
    aliasName   :   { type: String, required: false},
    aliasId     :   { type: Schema.Types.ObjectId, required: false, ref:"Alias"},
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    status      :   { type: Number, enum: STATUS,required:true, default:STATUS_PENDING },
    to          :   [{ type: Schema.Types.ObjectId, ref: 'User' }], //users, no users = public
    comments    :   [commentSchema],
    //STATS
    viewCount :   { type: Number, required:true, default:0},
    favouriteCount :   { type: Number, required:true, default:0},
    commentCount :   { type: Number, required:true, default:0},
    //
    renderParameters   :   { type: String, required: false},
    //
    shortlink   :   { type: String, required: false}


});

itemSchema.index({userId:1,status:1});
itemSchema.index({userId:1,visibility:1,status:1});
itemSchema.index({visibility:1,status:1});
itemSchema.index({created:-1});
itemSchema.index({radius:-1});
itemSchema.index({to:1,status:1});

var Item = mongoose.model('Item', itemSchema);
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
var itemInboxSchema = new Schema({
    userId      :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    ownerUserId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId      :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    created     :   { type: Date	, required: true, default: Date.now },
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true}
});

itemInboxSchema.index({userId:1,itemId:1},{unique:true}); //just one item per user
itemInboxSchema.index({itemId:1});
itemInboxSchema.index({status:1});
itemInboxSchema.index({radius:-1});

var ItemInbox = mongoose.model('ItemInbox', itemInboxSchema);
///------------------------
///------------------------
///------------------------
//          Service
///------------------------
///------------------------
///------------------------
var service = {};

service.create = function(message,mediaId,templateId,mapIconId,latitude,longitude,radius,to,locationName,locationAddress,aliasName,aliasId,userId,callback){
    var item = new Item();
    item.message = message;
    if(mediaId){
        item.mediaId = mediaId;
    }
    if(templateId){
        item.templateId = templateId;
    }
    if(mapIconId){
        item.mapIconId = mapIconId;
    }
    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = longitude;
    locationArray[LOCATION_LATITUDE] = latitude;
    item.location = locationArray;
    item.radius = radius;
    item.to = to;
    item.userId = userId;

    item.locationName = locationName;
    item.locationAddress = locationAddress;

    item.visibility = VISIBILITY_PRIVATE;

    if(!item.to || to.length == 0){
        delete item.to; //PUBLIC!
        item.visibility = VISIBILITY_PUBLIC;
        //We use this to reduce the index size, because if we use an index on item.to will grow faster
        // for the kind of information we want.
    } else {
        //TODO check users exists!
    }

    //TODO check owner exists!
    //TODO check iconId
    //TODO check templateId

    //find Alias
    if(aliasId && aliasId != ""){
        //if found, bring data
        //TODO check visibility and permissions
        AliasService.findById(aliasId,function(err, alias){
            if(err) return callback(err);

            item.aliasId = alias._id;
            item.aliasName = alias.name;
            item.locationAddress = alias.locationAddress;
            item.locationName = alias.locationName;
            item.location = alias.location;

            createProcess0(item,callback);
        });

    } else if(aliasName){
        //if no Id and Create Alias -> create a new one
        AliasService.create(userId,latitude,longitude,item.visibility,aliasName,locationName,locationAddress,function(err,alias){
            if(err) return callback(err);

            item.aliasId = alias._id;
            item.aliasName = alias.name;

            createProcess0(item,callback);
        });

    } else{
        //no alias

        delete item.aliasId;
        delete item.aliasName;

        createProcess0(item,callback);
    }

}

function createProcess0(item,callback){
    if(item.mapIconId){
        MapIconService.findById(item.mapIconId,function(err,mapIcon){
            if(err) return callback(err);
            if(!mapIcon) return callback("Map Icon not found");

            item.mapIconMediaId = mapIcon.mediaId;

            createProcess1(item,callback);
        })
    }else{
        createProcess1(item,callback);
    }
}

function createProcess1(item,callback){
    ItemUtils.generatePreviewImage(item,function(err,item){
        if(err) return callback(err);

        if(item.mediaId || item.templateMediaId ){
            item.status = STATUS_OK;
        }
        item.save(function(err){
            if(err){
                return callback(err);
            }
            if(bitly){
                bitly.shorten(BITLY_DOMAIN_ITEM_REDIRECT+item._id,BITLY_DOMAIN,function(err,response){
                    if(err){
                        return callback(err);
                    }
                    //console.log(response);
                    item.shortlink =  response.data.url;
                    item.save(function(err) {
                        if (err) {
                            return callback(err);
                        }
                        createProcess2(item,callback);
                    });
                })
            } else {
                createProcess2(item,callback);
            }


        })
    });
}
function createProcess2(item,callback){
    if (item.teaserMediaId) {
        MediaService.assign(item.teaserMediaId, [], MediaVars.VISIBILITY_PUBLIC, item._id, "Item#teaserMediaId", function (err) {
            if (err) console.error(err);

            createProcess3(item, callback);
        });
    } else {
        createProcess3(item, callback);
    }
}
function createProcess3(item,callback){
    if (item.mediaId) {
        var visibility = MediaVars.VISIBILITY_PRIVATE;
        if (item.visibility == VISIBILITY_PUBLIC) {
            visibility = MediaVars.VISIBILITY_PUBLIC;
        }
        MediaService.assign(item.mediaId, item.to, visibility, item._id, "Item#mediaId", function (err) {
            if (err) {
                //TODO remove item
                callback(err);
            } else {
                callback(null, item);
                createBackground(item);
            }
        });
    } else {
        callback(null, item);
        createBackground(item);
    }
}


function createBackground(item){

    //We return to the user but we keep working on the "background"
    //Send and notify users
    if(item.to && item.status == STATUS_OK){
        item.to.forEach(function(userId){
            //Check friendship!
            //FriendService.isFriend(userId,item.ownerUserId,function(err,isFriend){
            //    if(err){
            //        console.error(err);
            //    }else if(isFriend){
            var itemInbox = new ItemInbox();
            itemInbox.userId = userId;
            itemInbox.itemId = item._id;
            itemInbox.location = item.location;
            itemInbox.radius = item.radius;
            itemInbox.ownerUserId = item.userId;
            itemInbox.save(function(err){
                if(err){
                    console.error(err);
                }else{
                    EventService.onItemInboxCreated(itemInbox);
                }
            });
            //    } else {
            //        //TODO maybe send friend request?
            //    }
            //});


        })
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
                    pItem.templateId = item.templateId;
                    pItem.templateMediaId = item.templateMediaId;
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

                    var pItem = fillItem(item,userId);
                    pItem.canView = false;
                    pItem.favourited = (fav?true:false);

                    callback(null,pItem);
                })

            }
        });
    })
}

service.searchUnOpenedItemsByLocation = function(latitude,longitude,radius,userLatitude,userLongitude,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    //TODO dissapear from map
    var query = {to:userId,status:STATUS_OK};


    //Radius of earth 6371000 meters
    Item.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,userLongitude,userLatitude,userId,callback);
    });

}

service.searchPublicItemsByLocation = function(latitude,longitude,radius,userLatitude,userLongitude,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var query = {visibility:VISIBILITY_PUBLIC,status:STATUS_OK};

    //Radius of earth 6371000 meters
    Item.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,userLongitude,userLatitude,userId,callback);
    });

}

service.searchSentByMeItemsByLocation = function(latitude,longitude,radius,userLatitude,userLongitude,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var query = {userId:userId,visibility:VISIBILITY_PRIVATE,status:STATUS_OK};

    //Radius of earth 6371000 meters
    Item.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,userLongitude,userLatitude,userId,callback);
    });

}
service.searchByLocation = function(latitude,longitude,radius,userLatitude,userLongitude,userId,callback){
    var results ={};
    service.searchUnOpenedItemsByLocation(latitude,longitude,radius,userLatitude,userLongitude,userId,function(err,data){

        if(err) return callback(err);
        results.sentToMe = data;
        service.searchPublicItemsByLocation(latitude,longitude,radius,userLatitude,userLongitude,userId,function(err,data) {

            if (err) return callback(err);
            results.public = data;

            service.searchSentByMeItemsByLocation(latitude,longitude,radius,userLatitude,userLongitude,userId,function(err,data) {

                if (err) return callback(err);
                results.sentByMe = data;

                AliasService.search(latitude, longitude, radius, null, userId, function (err, data) {
                    if (err) return callback(err);
                    results.aliases = data;

                    callback(null, results);
                });
            });
        });
    });
}
function transformGeoNearResults(results,longitude,latitude,userId,transformCallback){
    /*var array = [];
    for(var i=0;i < results.length;i++){
        var mongoGeoNearObject = results[i];
        array.push(itemToPublicItemList(mongoGeoNearObject.obj));

    }*/
    //mapping each doc into new object and populating distance
    Utils.map(
        results,
        //Map Function
        function(geoResultItem,mapCallback){
            var transformedItem = fillItem( geoResultItem.obj,userId ,longitude,latitude);
            transformedItem.distance = geoResultItem.dis * AVERAGE_EARTH_RADIUS;//meters
            service.allowedToSeeContent(transformedItem._id,longitude,latitude,userId,function(err,canView){
                if(err){
                    console.err(err);
                } else{
                    if(canView){
                        transformedItem.message = geoResultItem.obj.message;
                        transformedItem.templateId = geoResultItem.obj.templateId;
                        transformedItem.mediaId = geoResultItem.obj.mediaId,
                        transformedItem.renderParameters = geoResultItem.obj.renderParameters;
                    }
                    transformedItem.canView = canView;
                }
                FavouriteItem.findOne({userId:userId,itemId:geoResultItem.obj._id},function(err,fav){
                    if(err) console.err(err);

                    transformedItem.favourited = (fav?true:false);

                    mapCallback(transformedItem);
                });
            });
        }
        ,
        //Callback
        function(results){

            // populating user object
            Item.populate( results, { path: 'user', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
                if (err) return callback(err);
                Item.populate( items, { path: 'to', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
                    if (err) return callback(err);
                    transformCallback(null, items);
                });
            });
        }
    )
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
                var publicItem = fillItem(item, userId,longitude,latitude);
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

                        var transformedItem = fillItem(dbItem,userId ,longitude,latitude);
                        service.allowedToSeeContent(transformedItem._id,longitude,latitude,userId,function(err,canView){
                            if(err){
                                console.err(err);
                            } else{
                                if(canView){
                                    transformedItem.message = dbItem.message;
                                    transformedItem.templateId = dbItem.templateId;
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
function fillItem(item,userId,longitude,latitude){
    var publicItem = {_id:item._id};
    publicItem.longitude = item.location[LOCATION_LONGITUDE];
    publicItem.latitude = item.location[LOCATION_LATITUDE];
    publicItem.radius = item.radius;
    publicItem.user = item.userId;
    publicItem.created = item.created;
    publicItem.locationAddress = item.locationAddress;
    publicItem.locationName = item.locationName;
    publicItem.aliasName = item.aliasName;
    publicItem.aliasId = item.aliasId;
    publicItem.templateId = item.templateId;
    publicItem.mapIconId = item.mapIconId;
    publicItem.mapIconMediaId = item.mapIconMediaId;
    publicItem.to = item.to;
    publicItem.viewCount = item.viewCount;
    publicItem.favouriteCount = item.favouriteCount;
    publicItem.commentCount = item.commentCount;
    publicItem.shortlink = item.shortlink;

    publicItem.teaserMediaId = item.teaserMediaId;
    publicItem.teaserMessage = item.teaserMessage;
    publicItem.teaserTemplateMediaId = item.teaserTemplateMediaId;
    publicItem.renderParameters = item.renderParameters;


    if(longitude && latitude){
        publicItem.userDistance = distance(item,longitude,latitude);
        publicItem.canView = inRange(item,longitude,latitude);
    }

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

                    var transformedItem = fillItem(dbFavItem.itemId,userId ,longitude,latitude);
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


///Old Stuff
//return callback(new NotStartedSeemError("Cannot add photos to a seem that has not started"))
/*function EndedSeemError(message) {
    this.name = 'ExpiredSeem';
    this.message = message;
    this.stack = (new Error()).stack;
}
EndedSeemError.prototype = new Error;
*/

module.exports = {
    Item: Item,
    Service:service
};
