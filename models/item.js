var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
    , Media = require("../models/media").Media
    , MediaService = require("../models/media").Service
    , MediaVars = require('../models/media')
    , FriendService = require("../models/friend").Service
    , EventService = require("../models/eventdispatcher.js").Service
    , Geolib = require('geolib')
    , Utils = require('../utils/utils')
    , textSearch = require('mongoose-text-search')
    , CronJob = require('cron').CronJob
    , CONSTANT_DATE = 1377966600  // is a constant and a very special date :)
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
    , TYPE_MESSAGE = 0
    , TYPE_IMAGE = 1
    , TYPE_VIDEO = 2
    , TYPES = [TYPE_MESSAGE,TYPE_IMAGE,TYPE_VIDEO]
    , STATUS_UNOPENED = 0
    , STATUS_OPENED = 1
    , STATUS_LEFT = 2
    , STATUS = [STATUS_UNOPENED,STATUS_OPENED,STATUS_LEFT]
    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1
    , VISIBILITY = [VISIBILITY_PRIVATE,VISIBILITY_PUBLIC]
    , LOCATION_LONGITUDE = 0
    , LOCATION_LATITUDE = 1
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
    , ACTION_COLLECTED = 0
    , ACTION_LEFT = 1
    , ACTIONS = [ACTION_COLLECTED,ACTION_LEFT]
    ;

var actionSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    type    :   { type: Number  , enum: ACTIONS,required:true},
    date    :   { type: Date	, required: true, default: Date.now }
});

var commentSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    comment :   { type: String  , required: true },
    date    :   { type: Date	, required: true, default: Date.now }
});

var itemSchema = new Schema({
    type        :   { type: Number, enum: TYPES,required:true, default:TYPE_MESSAGE},
    ownerUserId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    collectedUserId :   { type: Schema.Types.ObjectId, required: false, ref:"User"},
    created     :   { type: Date	, required: true, default: Date.now },
    message     :   { type: String, required: false},
    mediaId     :   { type: Schema.Types.ObjectId, required: false},
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true},
    status      :   { type: Number, enum: STATUS,required:true, default:STATUS_UNOPENED },
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    collectedCount :   { type: Number, required:true, default:0},
    leftCount   :   { type: Number, required:true, default:0},
    to          :   [Schema.Types.ObjectId], //users, no users = public
    comments    :   [commentSchema],
    actions     :   [actionSchema]


});

itemSchema.index({ownerUserId:1});
itemSchema.index({created:-1});
itemSchema.index({radius:-1});
itemSchema.index({status:1});

var Item = mongoose.model('Item', itemSchema);

var itemItemInboxSchema = new Schema({
    userId      :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    ownerUserId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId      :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    created     :   { type: Date	, required: true, default: Date.now },
    openedDate  :   { type: Date	, required:false },
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true},
    status      :   { type: Number, enum: STATUS,required:true, default:STATUS_UNOPENED }
});

itemItemInboxSchema.index({userId:1,itemId:1},{unique:true}); //just one item per user
itemItemInboxSchema.index({userId:1,openedDate:-1});
itemItemInboxSchema.index({itemId:1});
itemItemInboxSchema.index({status:1});
itemItemInboxSchema.index({radius:-1});

var ItemInbox = mongoose.model('ItemInbox', itemItemInboxSchema);

//Service?
var service = {};

service.create = function(type,message,mediaId,latitude,longitude,radius,to,ownerUserId,callback){
    var item = new Item();
    item.type = type;
    item.message = message;
    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = longitude;
    locationArray[LOCATION_LATITUDE] = latitude;
    item.location = locationArray;
    item.radius = radius;
    item.to = to;
    item.ownerUserId = ownerUserId;

    if(item.type != TYPE_MESSAGE){
        item.mediaId = mediaId;
    }

    if ( (item.type == TYPE_IMAGE || item.type == TYPE_VIDEO) && !item.mediaId ){
        return callback("You have to provide a media if the type is an image or a video");
    }

    if(!item.to || to.length == 0){
        delete item.to; //PUBLIC!
        item.visibility = VISIBILITY_PUBLIC;
        //We use this to reduce the index size, because if we use an index on item.to will grow faster
        // for the kind of information we want.
    } else {
        //TODO check users exists!
    }

    //TODO check owner exists!

    item.save(function(err){
        if(err){
            return callback(err);
        }
        if(item.mediaId){
            var visibility = MediaVars.VISIBILITY_PRIVATE;
            if(item.visibility == VISIBILITY_PUBLIC){
                visibility = MediaVars.VISIBILITY_PUBLIC;
            }
            MediaService.assign(item.mediaId,item.to,visibility,item._id,"Item#mediaId",function(err){
                if(err){
                    //TODO remove item
                    callback(err);
                }else{
                    callback(null,item);
                    createBackground(item);
                }
            });
        }else{
            callback(null,item);
            createBackground(item);
        }


    })
}

function createBackground(item){

    //We return to the user but we keep working on the "background"
    //Send and notify users
    if(item.to){
        item.to.forEach(function(userId){
            //Check friendship!
            FriendService.isFriend(userId,item.ownerUserId,function(err,isFriend){
                if(err){
                    console.error(err);
                }else if(isFriend){
                    var itemInbox = new ItemInbox();
                    itemInbox.userId = userId;
                    itemInbox.itemId = item._id;
                    itemInbox.location = item.location;
                    itemInbox.radius = item.radius;
                    itemInbox.ownerUserId = item.ownerUserId;
                    itemInbox.save(function(err){
                        if(err){
                            console.error(err);
                        }else{
                            EventService.onItemInboxCreated(itemInbox);
                        }
                    })
                } else {
                    //TODO maybe send friend request?
                }

            });


        })
    }
}

service.collect = function(itemId,longitude,latitude,userId,callback){
    ItemInbox.findOne({itemId:itemId},function(err,itemInbox){
        if(err) return callback(err);
        if(itemInbox && itemInbox.status == STATUS_OPENED){
            Item.findOne({_id:itemId},function(err,item){
                if(err) return callback(err);
                if(!item) return callback("Item not found ¿?");
                openItem(item,callback);
            });
        } else {
            var query =
                {
                _id:itemId,
                status:STATUS_UNOPENED
                };

            var update = {
                            $set    : {
                                        status: STATUS_OPENED,
                                        collectedUserId:userId
                                    },
                            $inc    : { collectedCount:1 },
                            $push   : { actions: {type:ACTION_COLLECTED,date:Date.now(),userId:userId} }
                        };

            if(!itemInbox){
                query.visibility = VISIBILITY_PUBLIC;
            }
            // This first query is to check location,
            // the other findOneAndUpdate is to guarrantee that no one opened the item between these two
            // queries.
            Item.findOne(query,function(err,item){
                if (err) return callback(err);
                if (!item) return callback("Item not found");
                //Check location
                //distance in meters
                var distance = Geolib.getDistance(
                        {latitude: item.location[LOCATION_LATITUDE], longitude: item.location[LOCATION_LONGITUDE] },
                        {latitude: latitude, longitude: longitude});

                if(distance > item.radius){
                    return callback("Not close enough");
                }
                //
                // Atomic operation
                //
                Item.findOneAndUpdate(
                    query,
                    update,
                    function(err,item) {
                        if (err) return callback(err);
                        if (!item) return callback("Item not found");

                        //FOUND
                        if (!itemInbox) {
                            itemInbox = new ItemInbox();
                            itemInbox.userId = userId;
                            itemInbox.itemId = item._id;
                            itemInbox.location = item.location;
                            itemInbox.radius = item.radius;
                            itemInbox.ownerUserId = item.ownerUserId;
                        }

                        itemInbox.status = STATUS_OPENED;
                        itemInbox.openedDate = Date.now();
                        itemInbox.save(function (err) {
                            if (err) return callback(err);
                            openItem(item, callback);
                            //TODO send a notification to the owner
                        });


                    });
            })



        }
    });
}


service.leave = function(itemId,userId,callback) {
    ItemInbox.findOneAndUpdate(
        {
            userId:userId,
            itemId:itemId,
            status:STATUS_OPENED
        },
        {
            $set:   { status:STATUS_LEFT }
        }
        ,
        function(err,item) {
            if (err) return callback(err);

            if (!item) return callback("Item not found in your inbox");

            Item.findOneAndUpdate(
                {_id: itemId, status: STATUS_OPENED},
                {
                    $set    : { status: STATUS_UNOPENED },
                    $unset  : { collectedUserId: "" },
                    $inc    : { leftCount: 1},
                    $push   : { actions: {type:ACTION_LEFT,date:Date.now(),userId:userId} }
                }
                ,
                function (err, item) {
                    if (err) return callback(err);
                    if (!item) return callback("Item not found");

                    callback(null);
            });
        }
    );
}


function openItem(item,callback){
    callback(null);//,{type:item.type,mediaId:item.mediaId,message:item.message});
}


service.searchUnOpenedItemsByLocation = function(latitude,longitude,radius,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var query = {userId:userId,status:STATUS_UNOPENED};

    //Radius of earth 6371000 meters
    ItemInbox.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,callback);
    });

}

service.searchOpenedItemsByLocation = function(latitude,longitude,radius,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var query = {userId:userId,status:STATUS_OPENED};

    //Radius of earth 6371000 meters
    ItemInbox.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,callback);
    });

}

service.searchSentItemsByLocation = function(latitude,longitude,radius,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var query = {ownerUserId:userId};

    //Radius of earth 6371000 meters
    Item.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,callback);
    });

}

service.searchPublicItemsByLocation = function(latitude,longitude,radius,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var query = {visibility:VISIBILITY_PUBLIC};

    //Radius of earth 6371000 meters
    Item.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
        if(err) return callback(err);
        transformGeoNearResults(results,callback);
    });

}
service.searchByLocation = function(latitude,longitude,radius,userId,callback){
    var results ={};
    service.searchUnOpenedItemsByLocation(latitude,longitude,radius,userId,function(err,data){
        if(err) return callback(err);
        results.sentToMe = data;

        service.searchOpenedItemsByLocation(latitude,longitude,radius,userId,function(err,data) {
            if (err) return callback(err);
            results.opened = data;

            service.searchSentItemsByLocation(latitude,longitude,radius,userId,function(err,data) {
                if (err) return callback(err);
                results.sentByMe = data;

                service.searchPublicItemsByLocation(latitude,longitude,radius,userId,function(err,data) {
                    if (err) return callback(err);
                    results.public = data;

                    callback(null,results);
                });
            });
        });
    });
}
function transformGeoNearResults(results,callback){
    /*var array = [];
    for(var i=0;i < results.length;i++){
        var mongoGeoNearObject = results[i];
        array.push(itemToPublicItemList(mongoGeoNearObject.obj));

    }*/
    //mapping each doc into new object and populating distance
    results = results.map(function(x) {
        var a = ToPublicItemList( x.obj );
        a.distance = x.dis * AVERAGE_EARTH_RADIUS;//meters
        return a;
    });

    // populating user object
    Item.populate( results, { path: 'ownerUser', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
        if (err) return callback(err);
        callback(null,items);
    });


}
function ToPublicItemList(item){
    var transformed ={latitude:item.location[LOCATION_LATITUDE],longitude:item.location[LOCATION_LONGITUDE],radius:item.radius,ownerUser:item.ownerUserId};

    if(item instanceof Item){
        transformed.itemId = item._id;
    }else{
        transformed.itemId = item.itemId;
    }
    return transformed;
}

service.view = function(itemId,userId,callback){
    Item.findOne({_id:itemId})
        .populate("ownerUserId",PUBLIC_USER_FIELDS)
        .populate("collectedUserId",PUBLIC_USER_FIELDS)
        .populate("comments.userId",PUBLIC_USER_FIELDS)
        .populate("actions.userId",PUBLIC_USER_FIELDS)
        .exec(function(err,item){
            if(err) return callback(err);
            if(!item) return callback("Item not found");

            var publicItem = {_id:item._id};
            publicItem.longitude = item.location[LOCATION_LONGITUDE];
            publicItem.latitude = item.location[LOCATION_LATITUDE];
            publicItem.radius = item.radius;
            publicItem.ownerUser = item.ownerUserId;
            publicItem.collectedCount = item.collectedCount;
            publicItem.leftCount = item.leftCount;
            publicItem.actions = item.actions;
            publicItem.comments = item.comments;
            publicItem.collectedUser = item.collectedUserId;
            publicItem.type = item.type;
            publicItem.mediaId = item.mediaId;
            publicItem.message = item.message;

            if(String(item.ownerUserId._id) == String(userId) ||
                (item.collectedUserId && String(item.collectedUserId._id) == String(userId))){
                return callback(null,publicItem);
            }

            delete publicItem.type;
            delete publicItem.mediaId;
            delete publicItem.message;


            var containsTo = false;

            for (var i = 0; i < item.to.length && !containsTo; i++) {
                if (String(item.to[i]) == String(userId)) {
                    containsTo = true;
                }
            }

            if(containsTo){
                return callback(null,publicItem);
            }

            if(item.visibility == VISIBILITY_PRIVATE){
                return callback("Not permitted");
            }

            delete publicItem.comments;
            delete publicItem.actions;

            return callback(null,publicItem);
    });

}

service.addComment = function(itemId,comment,userId,callback) {
    Item.findOne({_id: itemId})
        .exec(function (err, item) {
            if (err) return callback(err);
            if (!item) return callback("Item not found");

            var allowed = false;

            if (String(item.ownerUserId) == String(userId) ||
                (item.collectedUserId && String(item.collectedUserId) == String(userId))) {
                allowed = true;
            }

            for (var i = 0; i < item.to.length && !allowed; i++) {
                if (String(item.to[i]) == String(userId)) {
                    allowed = true;
                }
            }

            if (!allowed) return callback("Not allowed");

            Item.update(
                {_id: item},
                {$push: {comments: {userId:userId,data:Date.now(),comment:comment}}},
                function (err) {
                    callback(err);
                });
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