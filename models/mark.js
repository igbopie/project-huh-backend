var mongoose = require('mongoose')
    , Schema = mongoose.Schema

    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1
    , VISIBILITY = [VISIBILITY_PRIVATE,VISIBILITY_PUBLIC]
    , LOCATION_LONGITUDE = 0
    , LOCATION_LATITUDE = 1
    , AVERAGE_EARTH_RADIUS = 6371000 //In meters
    ;

var markSchema = new Schema({
    name:   { type: String, required: true},
    userId  :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    date    :   { type: Date	, required: true, default: Date.now },
    location    :   { type: [Number], required:true,index: '2dsphere'},
    locationName:   { type: String, required: false},
    locationAddress:   { type: String, required: false},
    radius      :   { type: Number, required:true},
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    mapIconId   :   { type: Schema.Types.ObjectId, required: false},
    mapIconMediaId   :   { type: Schema.Types.ObjectId, required: false},
    to          :   [{ type: Schema.Types.ObjectId, ref: 'User' }], //users, no users = public
    shortlink   :   { type: String, required: false}
});


markSchema.index({visibility:1,userId:1});
markSchema.index({name:1});


var Mark = mongoose.model('Mark', markSchema);

//Service?
var service = {};

service.create = function(userId,latitude,longitude,visibility,name,locationName,locationAddress,callback){
    var alias = new Mark();
    alias.userId = userId;
    alias.visibility = visibility;
    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = longitude;
    locationArray[LOCATION_LATITUDE] = latitude;
    alias.name = name;
    alias.locationAddress = locationAddress;
    alias.locationName = locationName;
    alias.location = locationArray;
    alias.save(function(err){
        if(err){
            return callback(err);
        }
        callback(null,alias);
    });
}

service.findById = function(id,callback){
    Mark.findOne({_id:id},function(err,doc){
        callback(err,doc);
    });
}

service.search = function(latitude,longitude,radius,text,userId,callback){

    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = Number(longitude);
    locationArray[LOCATION_LATITUDE] = Number(latitude);

    var point = {type: 'Point', coordinates: locationArray};

    //TODO private and public
    //TODO indexes

    var query = {};
    if(text){
        query = {name: { $regex: text, $options: 'i' } }
    }
    if(!radius || !latitude || !longitude){
        Mark.find(query,function(err,results){
            callback(err,results);
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
            callback(null,results);
            /*
            // populating user object
            Item.populate( results, { path: 'ownerUser', model: 'User', select: PUBLIC_USER_FIELDS }, function(err,items) {
                if (err) return callback(err);

            });*/
        });
    }

}


//search by location and radius or/and text
//pipeline aggregation framework with geonear & text


module.exports = {
    Alias: Mark,
    Service:service
};