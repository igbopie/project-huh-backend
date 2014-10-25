var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , MapIconService = require("../models/mapicon").Service
    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1
    , VISIBILITY = [VISIBILITY_PRIVATE,VISIBILITY_PUBLIC]
    , LOCATION_LONGITUDE = 0
    , LOCATION_LATITUDE = 1
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
    , Q = require("q")
    , Geolib = require('geolib')
    , Utils = require('../utils/utils')
    , UrlShortener = require('../utils/urlshortener')
    ;



var markSchema = new Schema({
    name:   { type: String, required: true},
    description:   { type: String, required: false},
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    created    :   { type: Date	, required: true, default: Date.now },
    updated    :   { type: Date	, required: true, default: Date.now },
    location    :   { type: [Number], required:true,index: '2dsphere'},
    locationName:   { type: String, required: false},
    locationAddress:   { type: String, required: false},
    radius      :   { type: Number, required:true},
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    mapIconId   :   { type: Schema.Types.ObjectId, required: true},
    mapIconMediaId   :   { type: Schema.Types.ObjectId, required: true},
    members          :   [{ type: Schema.Types.ObjectId, ref: 'User' }], //users, no users = public
    memberCount :   { type: Number, required:true, default:0},
    shortlink   :   { type: String, required: false},
    itemCount :   { type: Number, required:true, default:0},
    items: [],
    favouriteCount:  { type: Number, required:true, default:0}
});


markSchema.index({visibility:1,members:1});
markSchema.index({members:1,userId:1});
markSchema.index({visibility:1,userId:1});
markSchema.index({name:1});


var Mark = mongoose.model('Mark', markSchema);


var favouriteMarkSchema = new Schema({
    userId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    markId :   { type: Schema.Types.ObjectId, required: true, ref:"Mark"},
    date: { type: Date	, required: true, default: Date.now },
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE }

});

favouriteMarkSchema.index({userId:1,visibility:1,date:-1});
favouriteMarkSchema.index({userId:1,markId:1},{unique:true});

var FavouriteMark = mongoose.model('FavouriteMark', favouriteMarkSchema);

//Service?
var service = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Mark: Mark,
    FavouriteMark:FavouriteMark,
    Service:service
};

var viewMarkSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    markId  :   { type: Schema.Types.ObjectId, required: true, ref:"Mark"},
    lastViewed:  { type: Date, required: true, default: Date.now },
    count   :   { type: Number , required:true, default:0}
});

viewMarkSchema.index({userId:1,markId:1});

var ViewMark = mongoose.model('ViewMark', viewMarkSchema);

var viewMarkStatsSchema = new Schema({
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    markId  :   { type: Schema.Types.ObjectId, required: true, ref:"Mark"},
    date:  { type: Date, required: true, default: Date.now }
});

var ViewMarkStats = mongoose.model('ViewMarkStats', viewMarkStatsSchema);


// Now we can import
var Item = require ('../models/item').Item
    , ItemService = require ('../models/item').Service

    , UserService = require("../models/user").Service;

service.create = function(userId,latitude,longitude,radius,to,name,description,locationName,locationAddress,mapIconId){
    var promise = Q.defer();

    var alias = new Mark();
    alias.userId = userId;
    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = longitude;
    locationArray[LOCATION_LATITUDE] = latitude;
    alias.location = locationArray;
    alias.radius = radius;
    alias.name = name;
    alias.locationAddress = locationAddress;
    alias.locationName = locationName;
    alias.mapIconId = mapIconId;
    alias.members = to;
    alias.visibility = VISIBILITY_PRIVATE;
    alias.description = description;

    if(!alias.members || alias.members.length == 0){
        delete alias.members; //PUBLIC!
        alias.visibility = VISIBILITY_PUBLIC;
        //We use this to reduce the index size, because if we use an index on item.to will grow faster
        // for the kind of information we want.
    } else {
        //TODO check users exists!
        alias.members.push(userId);
        alias.memberCount = alias.members.length;
    }

    MapIconService.findById(mapIconId,function(err,mapIcon){
        if(err){
            promise.reject(err);
        } else if(!mapIcon){
            promise.reject("Map icon not found")
        } else {
            alias.mapIconMediaId = mapIcon.mediaId;
            alias.save(function (err) {
                if (err) {
                    promise.reject(err);
                } else {
                    UrlShortener.shortenMark(alias._id,function(err,shortlink){
                        if (err) {
                            promise.reject(err);
                        } else {
                            alias.shortlink = shortlink;
                            alias.save(function (err) {
                                UserService.addMarkHandler(alias,function(err){
                                    if (err) {
                                        promise.reject(err);
                                    } else {
                                        promise.resolve(alias);
                                    }
                                });

                            });
                        }
                    });
                }
            });
        }
    });

    return promise.promise;
}

service.findById = function(id,callback){
    Mark.findOne({_id:id},function(err,doc){
        callback(err,doc);
    });
}

service.findByIdForWeb = function(markId,callback){
    Mark.findOne({_id:markId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .exec(function(err,item){
            callback(err,item);
        });
}

service.search = function(latitude,longitude,radius,text,userLatitude,userLongitude,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var querySentToMeMarks = {visibility:VISIBILITY_PRIVATE,members:userId};
    var queryPublicMarks = {visibility:VISIBILITY_PUBLIC};

    var query = { $or: [querySentToMeMarks,queryPublicMarks]}

    if(text){
        query.name ={ $regex: text, $options: 'i' };
    }

    if(!radius || !latitude || !longitude){
        Mark.find(query,function(err,results){
            if(err) return callback(err);

            processResults(results,userId,callback);
        });
    }else{
        //Radius of earth 6371000 meters
        Mark.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
            if(err) return callback(err);

            results = results.map(function(x) {
                var a = x.obj;
                //a.dis = x.dis;//meters
                return a;
            });

            processResults(results,userId,userLatitude,userLongitude,callback);
        });
    }

}

service.view = function(markId,userId,userLongitude,userLatitude,callback){
    Mark.findOne({_id:markId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .populate({ path: 'to', model: 'User', select: PUBLIC_USER_FIELDS })
        .populate({ path: 'members', model: 'User', select: PUBLIC_USER_FIELDS })
        .exec(function(err,mark){
            if(err) return callback(err);
            if(!mark) return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND,"Not found"));

            service.fillMark(mark,userId,userLongitude,userLatitude,true,function(err,mark){
                if(err) return callback(err);

                if(mark.canView){
                    //Save stat
                    ViewMark.findOneAndUpdate(
                        {
                            userId:userId,
                            markId:mark._id
                        },
                        {
                            $set:{lastViewed:Date.now()},
                            $inc:{count:1}
                        },
                        {
                            upsert: true
                        },
                        function(err,view) {
                            if (err) console.log(err);
                            if (view) {
                                if (view.count == 1) {
                                    //TODO
                                    //EventService.onItemViewed(itemId, userId);
                                }
                            }
                        }
                    );

                }
                //We won't wait
                callback(null,mark);

            });
        });
}

function processResults(results,userId,userLatitude,userLongitude,transformCallback){

    //mapping each doc into new object and populating distance
    // populating user object
    Mark.populate( results, { path: 'userId', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
        if (err) return callback(err);
        Mark.populate( items, { path: 'members', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
            if (err) return callback(err);
            Utils.map(
                items,
                //Map Function
                function(geoResultMark,mapCallback){
                    service.fillMark(geoResultMark,userId,userLongitude,userLatitude,true,function(err,mark){
                        if(err) console.error(err);

                        mapCallback(mark);
                    });
                }
                ,
                //Callback
                function(results){
                    transformCallback(null, results);
                }
            )
        });
    });

}

service.canViewMark = function (markId,userId,userLongitude,userLatitude,callback){
    Mark.findOne({_id:markId},function(error,dbMark){
        if(error) return callback(error);

        var markDistance;
        var markInRange;
        if(userLongitude){
            markDistance = distance(dbMark,userLongitude,userLatitude);
            markInRange =  inRange(dbMark,userLongitude,userLatitude);
        }


        var canSee = false;
        var containsTo = false;
        var ownerUserId;

        //+++PRE PROCESS
        //Sometimes it's populated
        if (dbMark.userId instanceof mongoose.Types.ObjectId) {
            ownerUserId = dbMark.userId;
        } else if (dbMark.userId) {
            ownerUserId = dbMark.userId._id;
        }

        for (var i = 0; i < dbMark.members.length && !containsTo; i++) {
            var toUserId = "";
            var toUserElement = dbMark.members[i];

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
        if (dbMark.visibility == VISIBILITY_PUBLIC && userLongitude && userLatitude && markInRange) {
            canSee = true;
        }

        if (dbMark.visibility == VISIBILITY_PUBLIC && dbMark.radius == 0) {
            canSee = true;
        }

        if (dbMark.visibility == VISIBILITY_PRIVATE && containsTo && dbMark.radius == 0) {
            canSee = true;
        }

        if (dbMark.visibility == VISIBILITY_PRIVATE && containsTo && userLongitude && userLatitude && markInRange) {
            canSee = true;
        }

        if(dbMark.visibility == VISIBILITY_PRIVATE && !containsTo && String(ownerUserId) != String(userId)){
            return callback(new Utils.error(Utils.ERROR_CODE_UNAUTHORIZED,"Not authorized"));
        }

        ViewMark.findOne({userId:userId,markId:dbMark._id},function(err,viewMark){
            if(err) return callback(err);
            var lastViewed;
            if(viewMark){
               lastViewed = viewMark.lastViewed;
            }
            callback(null,{
                canView:canSee,
                distance:markDistance,
                lastViewed: lastViewed
            });
        });

    });

}

service.favourite = function(markId,userId,callback){


    Mark.findById(markId,function(err,mark){
        if(err){
            return callback(err);
        }
        if(!mark){
            return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND,"Not found"));
        }

        var fav = new FavouriteMark();
        fav.markId = markId;
        fav.visibility = mark.visibility;
        fav.userId = userId;
        fav.save(function(err){
            //Already favourited
            if(err && err.code == 11000) return callback();

            if(err) return callback(err);

            Mark.update({_id:markId},{$inc:{favouriteCount:1}},function(err){
                if(err) return callback(err);
                callback();
            });
        });
    })

}


service.unfavourite = function(markId,userId,callback){

    FavouriteMark.findOne({userId:userId,markId:markId},function(err,favDoc){
        if(err) return callback(err);
        if(!favDoc) return callback("Not Favourited");

        favDoc.remove(function(err){
            if(err) return callback(err);

            Mark.update({_id:markId},{$inc:{favouriteCount:-1}},function(err){
                if(err) return callback(err);
                callback();
            });
        });
    });

}

function inRange(mark,longitude,latitude){
    if(mark.radius == 0){
        return true;
    }
    if(distance(mark,longitude,latitude) > mark.radius){
        return false;
    }else{
        return true;
    }

}

function distance(mark,longitude,latitude){
    //Check location
    //distance in meters
    var distance = Geolib.getDistance(
        {latitude: mark.location[LOCATION_LATITUDE], longitude: mark.location[LOCATION_LONGITUDE] },
        {latitude: latitude, longitude: longitude});
    return distance;
}


service.fillMark = function(dbMark,userId,userLongitude,userLatitude,includeLatest,callback){
    service.canViewMark(dbMark._id,userId,userLongitude,userLatitude,function(err,permissions) {
        if (err) return callback(err);

        var transformedMark = {
            _id: dbMark._id,
            longitude: dbMark.location[LOCATION_LONGITUDE],
            latitude: dbMark.location[LOCATION_LATITUDE],
            radius: dbMark.radius,
            name: dbMark.name,
            description: dbMark.description,
            user: dbMark.userId,
            members: dbMark.members,
            memberCount: dbMark.memberCount,
            mapIconMediaId: dbMark.mapIconMediaId,
            mapIconId: dbMark.mapIconId,
            itemCount: dbMark.itemCount,
            canView: permissions.canView,
            favouriteCount: dbMark.favouriteCount,
            locationName: dbMark.locationName,
            locationAddress: dbMark.locationAddress,
            created: dbMark.created,
            updated: dbMark.updated,
            shortlink: dbMark.shortlink,
            followed: false,
            favourited: false
        }

        if (userLongitude && userLatitude) {
            transformedMark.distance = distance(dbMark,userLongitude,userLatitude);
        }
        FavouriteMark.findOne({userId: userId, markId: dbMark._id}, function (err, fav) {
            if (err) return callback(err);

            transformedMark.favourited = (fav ? true : false);

            if(includeLatest) {
                transformedMark.items = [];
                Item.findOne({markId: dbMark._id})
                    .sort({created: -1 })
                    .populate("userId", PUBLIC_USER_FIELDS)
                    .exec(function (err, latestItem) {
                        if (err) return callback(err);

                        if (latestItem) {
                            ItemService.fillItem(latestItem, userLongitude, userLatitude, userId, function (err, item) {
                                if (err) return callback(err);
                                transformedMark.items.push(item);
                                callback(null, transformedMark);
                            });
                        } else {
                            callback(null, transformedMark);
                        }


                    });
            }else{
                callback(null, transformedMark);
            }
        });
    });
}