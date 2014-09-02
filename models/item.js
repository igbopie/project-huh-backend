var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
    , Media = require("../models/media").Media
    , MediaService = require("../models/media").Service
    , MediaVars = require('../models/media')
    , AliasService = require("../models/alias").Service
    , FriendService = require("../models/friend").Service
    , TemplateService = require("../models/template").Service
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
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
;



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
    templateId  :   { type: String, required: false},
    mediaId     :   { type: Schema.Types.ObjectId, required: false},
    //--
    // A pre rendered image of the message
    previewMediaId:   { type: Schema.Types.ObjectId, required: false},
    mapIconId   :   { type: String, required: false},
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true},
    locationName:   { type: String, required: false},
    locationAddress:   { type: String, required: false},
    aliasName   :   { type: String, required: false},
    aliasId     :   { type: Schema.Types.ObjectId, required: false, ref:"Alias"},
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    to          :   [{ type: Schema.Types.ObjectId, ref: 'User' }], //users, no users = public
    comments    :   [commentSchema],
    //STATS
    viewCount :   { type: Number, required:true, default:0},
    favouriteCount :   { type: Number, required:true, default:0},
    //
    renderParameters   :   { type: String, required: false}
    //


});

itemSchema.index({userId:1});
itemSchema.index({userId:1,visibility:1});
itemSchema.index({visibility:1});
itemSchema.index({created:-1});
itemSchema.index({radius:-1});
itemSchema.index({to:1});

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
    dates   :   { type: [Date], required: true, default: [] },
    count   :   { type: Number , required:true, default:0}
});

viewItemSchema.index({userId:1,itemId:1});
var ViewItem = mongoose.model('ViewItem', viewItemSchema);
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

            createProcess(item,callback);
        });

    } else if(aliasName){
        //if no Id and Create Alias -> create a new one
        AliasService.create(userId,latitude,longitude,item.visibility,aliasName,locationName,locationAddress,function(err,alias){
            if(err) return callback(err);

            item.aliasId = alias._id;
            item.aliasName = alias.name;

            createProcess(item,callback);
        });

    } else{
        //no alias

        delete item.aliasId;
        delete item.aliasName;

        createProcess(item,callback);
    }

}

function createProcess(item,callback){
    ItemUtils.generatePreviewImage(item,function(item){
        //console.log(item);
        item.save(function(err){
            if(err){
                return callback(err);
            }

            MediaService.assign(item.previewMediaId,[],MediaVars.VISIBILITY_PUBLIC,item._id,"Item#previewMediaId",function(err) {
                if(err) console.error(err);
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
            });
        })
    });
}

function createBackground(item){

    //We return to the user but we keep working on the "background"
    //Send and notify users
    if(item.to){
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
service.findById = function(itemId,callback){
    Item.findOne({_id:itemId},function(err,item){
        callback(err,item);
    });
}
service.view = function(itemId,longitude,latitude,userId,callback){
    service.allowedToSeeContent(itemId,longitude,latitude,userId,function(err,allowed){
        if(allowed){
            Item.findOne({_id:itemId})
                .populate("userId",PUBLIC_USER_FIELDS)
                .populate("comments.userId",PUBLIC_USER_FIELDS)
                .exec(function(err,item){
                if(err) return callback(err);
                if(!item) return callback("Not found");

                    ViewItem.update(
                        {
                            userId:userId,
                            itemId:item._id
                        },
                        {
                            $push:{dates:Date.now()},
                            $inc:{count:1}
                        },
                        {
                            upsert: true
                        },
                        function(err){
                            if(err) console.log(err);
                        }
                    );

                    Item.findOneAndUpdate(
                        {_id:item._id},
                        {$inc: { viewCount:1 }},
                        function(err){
                            if(err) console.log(err);
                        }
                    );

                    FavouriteItem.findOne({userId:userId,itemId:item._id},function(err,fav){
                        if(err) return callback(err);

                        var pItem = fillItem(item,userId);
                        pItem.message = item.message;
                        pItem.templateId = item.templateId;
                        pItem.mediaId = item.mediaId,
                            pItem.renderParameters = item.renderParameters;
                        pItem.comments = item.comments;
                        pItem.favourited = (fav?true:false);

                        callback(null,pItem);
                    })


            });
        }else{
            callback(null,null);
        }
    })
}

service.searchUnOpenedItemsByLocation = function(latitude,longitude,radius,userLatitude,userLongitude,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    //TODO dissapear from map
    var query = {to:userId};


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

    var query = {visibility:VISIBILITY_PUBLIC};

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

    var query = {userId:userId,visibility:VISIBILITY_PRIVATE};

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
        function(x,mapCallback){
            var a = fillItem( x.obj,userId ,longitude,latitude);
            a.distance = x.dis * AVERAGE_EARTH_RADIUS;//meters
            service.allowedToSeeContent(a._id,longitude,latitude,userId,function(err,canView){
                if(err){
                    console.err(err);
                } else{
                    a.canView = canView;
                }
                mapCallback(a);
            });
        }
        ,
        //Callback
        function(results){

            // populating user object
            Item.populate( results, { path: 'user', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
                if (err) return callback(err);
                transformCallback(null,items);
            });
        }
    )
}


service.listSentToMe = function(userId,callback){
    finishItemQuery(
           Item.find({to:userId})
               .sort({created:-1}
           )
        ,null,null,userId,callback);

}

service.listSentByMe = function(userId,callback){
    finishItemQuery(
        Item.find({userId:userId})
            .sort({created:-1}
        )
        ,null,null,userId,callback);
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
                //Collection
                item = item.map(function(x) {
                    var a = fillItem(x, userId,longitude,latitude);
                    return a;
                });
                callback(null, item);
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
    publicItem.openedDate = item.openedDate;
    publicItem.locationAddress = item.locationAddress;
    publicItem.locationName = item.locationName;
    publicItem.aliasName = item.aliasName;
    publicItem.aliasId = item.aliasId;
    publicItem.templateId = item.templateId;
    publicItem.mapIconId = item.mapIconId;
    publicItem.previewMediaId = item.previewMediaId;
    publicItem.to = item.to;
    publicItem.viewCount = item.viewCount;
    publicItem.favouriteCount = item.favouriteCount;


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
                if (!canView) return callback("Not allowed");

                Item.update(
                    {_id: item},
                    {$push: {comments: {userId:userId,data:Date.now(),comment:comment}}},
                    function (err) {
                        callback(err);
                    });
            })

        });
}

service.allowedToSeeContent = function(itemId,longitude,latitude,userId,callback){
    Item.findOne({_id:itemId},function(err,item) {
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

service.listFavourites = function(userId,callback){

    FavouriteItem.find({userId:userId})
        .populate("itemId")
        .exec(function(err,favs){
            if(err) return callback(err);

            favs = favs.map(function(favI){
                if(err) return callback(err);

                return fillItem(favI.itemId);
            });

            callback(null,favs);

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
