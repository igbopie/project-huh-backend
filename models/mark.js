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
    ;



var markSchema = new Schema({
    name:   { type: String, required: true},
    description:   { type: String, required: false},
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    date    :   { type: Date	, required: true, default: Date.now },
    location    :   { type: [Number], required:true,index: '2dsphere'},
    locationName:   { type: String, required: false},
    locationAddress:   { type: String, required: false},
    radius      :   { type: Number, required:true},
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    mapIconId   :   { type: Schema.Types.ObjectId, required: true},
    mapIconMediaId   :   { type: Schema.Types.ObjectId, required: true},
    to          :   [{ type: Schema.Types.ObjectId, ref: 'User' }], //users, no users = public
    shortlink   :   { type: String, required: false},
    itemCount :   { type: Number, required:true, default:0},
    items: []
});


markSchema.index({visibility:1,to:1});
markSchema.index({visibility:1,userId:1});
markSchema.index({name:1});


var Mark = mongoose.model('Mark', markSchema);
//Service?
var service = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Mark: Mark,
    Service:service
};

// Now we can import
var Item = require ('../models/item').Item
    , ItemService = require ('../models/item').Service;

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
    alias.to = to;
    alias.visibility = VISIBILITY_PRIVATE;
    alias.description = description;

    if(!alias.to || to.length == 0){
        delete alias.to; //PUBLIC!
        alias.visibility = VISIBILITY_PUBLIC;
        //We use this to reduce the index size, because if we use an index on item.to will grow faster
        // for the kind of information we want.
    } else {
        //TODO check users exists!
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
                    promise.resolve(alias._id);
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



service.search = function(latitude,longitude,radius,text,userLatitude,userLongitude,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    var queryPrivateOwnMarks = {visibility:VISIBILITY_PRIVATE,userId:userId};
    var querySentToMeMarks = {visibility:VISIBILITY_PRIVATE,to:userId};
    var queryPublicMarks = {visibility:VISIBILITY_PUBLIC};

    var query = { $or: [queryPrivateOwnMarks,querySentToMeMarks,queryPublicMarks]}

    if(text){
        query.name ={ $regex: text, $options: 'i' };
    }

    if(!radius || !latitude || !longitude){
        Mark.find(query,function(err,results){
            if(err) return callback(err);

            processResults(results,callback);
        });
    }else{
        //Radius of earth 6371000 meters
        Mark.geoNear(point, {maxDistance:Number(radius)/AVERAGE_EARTH_RADIUS , spherical: true, query:query}, function (err, results,stats) {
            if(err) return callback(err);

            results = results.map(function(x) {
                var a = x.obj;
                //a.distance = x.dis * AVERAGE_EARTH_RADIUS;//meters
                return a;
            });

            processResults(results,userLatitude,userLongitude,callback);
        });
    }

}

service.view = function(markId,userId,callback){
    Mark.findOne({_id:markId})
        .populate("userId",PUBLIC_USER_FIELDS)
        .populate({ path: 'to', model: 'User', select: PUBLIC_USER_FIELDS })
        .exec(function(err,mark){
            if(err) return callback(err);
            if(!mark) return callback("Not found");

            var containsTo = false;
            //Sometimes it's populated
            for (var i = 0; i < mark.to.length && !containsTo; i++) {
                var toUserId = "";
                var toUserElement = mark.to[i];
                if (toUserElement instanceof mongoose.Types.ObjectId) {
                    toUserId = toUserElement;
                } else {
                    toUserId = toUserElement._id;
                }


                if (String(toUserId) == String(userId)) {
                    containsTo = true;
                }
            }

            if(mark.userId._id.equals(userId) ||
                containsTo == true ||
                mark.visibility == VISIBILITY_PUBLIC
                ){
                callback(null,fillMark(mark));
            }else {
                callback(Utils.error(Utils.ERROR_CODE_UNAUTHORIZED,"Not permitted"));
            }



    });
}

function processResults(results,userLatitude,userLongitude,transformCallback){

    //mapping each doc into new object and populating distance
    // populating user object
    Mark.populate( results, { path: 'userId', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
        if (err) return callback(err);
        Mark.populate( items, { path: 'to', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
            if (err) return callback(err);
            Utils.map(
                results,
                //Map Function
                function(geoResultMark,mapCallback){
                    Item.findOne({markId:geoResultMark._id},null,{sort: {created: -1 }},function(err,latestItem){
                        if(err) console.error(err);

                        var transformedMark = fillMark(geoResultMark,userLongitude,userLatitude);
                        if(latestItem) {
                            transformedMark.items.push(ItemService.fillItem(latestItem));
                        }

                        mapCallback(transformedMark);

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


function fillMark(dbMark,userLongitude,userLatitude){
    var transformedMark = {
        _id:dbMark._id,
        longitude: dbMark.location[LOCATION_LONGITUDE],
        latitude: dbMark.location[LOCATION_LATITUDE],
        radius: dbMark.radius,
        name: dbMark.name,
        user: dbMark.userId,
        to: dbMark.to,
        mapIconMediaId: dbMark.mapIconMediaId,
        mapIconId: dbMark.mapIconId,
        items:[]
        //distance: geoResultMark.dis * AVERAGE_EARTH_RADIUS
    }

    if(userLongitude && userLatitude){
        transformedMark.userDistance = distance(dbMark,userLongitude,userLatitude);
        transformedMark.canView = inRange(dbMark,userLongitude,userLatitude);
    }

    /*if(dbMark.items){
        transformedMark.items = [];
        for(var i = 0; i < dbMark.items.length;i++){
            transformedMark.items[i] = ItemService.fillItem(dbMark.items[i]);
        }

        console.log(transformedMark.items);
    }*/

    return transformedMark;
}

//search by location and radius or/and text
//pipeline aggregation framework with geonear & text

