var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var MediaService = require('../models/media').Service;
var MediaVars = require('../models/media');

var mapiconSchema = new Schema({
    name        :   { type: String, required: true},
    tag       :   { type: String, required:false},
    mediaId     :   { type: Schema.Types.ObjectId, required: true},
    created     :   { type: Date, required: true, default: Date.now },
    updated     :   { type: Date, required: true, default: Date.now }
});

mapiconSchema.index({updated:-1});

var MapIcon = mongoose.model('MapIcon', mapiconSchema);


var service = {};

service.create = function (name,tag,mediaId,callback){
    var mapIcon = new MapIcon();
    mapIcon.name = name;
    mapIcon.tag = tag;
    mapIcon.mediaId = mediaId;
    mapIcon.save(function(err){
        if(err) return callback(err,null);
        MediaService.assign(mapIcon.mediaId,[],MediaVars.VISIBILITY_PUBLIC,mapIcon._id,"MapIcon#mediaId",function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, mapIcon);
            }
        })

    });
}

service.update = function (id,name,tag,mediaId,callback){
    MapIcon.findOne({_id:id},function(err,mapIcon){
        if(err) return callback(err);

        mapIcon.name = name;
        mapIcon.tag = tag;
        mapIcon.mediaId = mediaId;
        mapIcon.updated = Date.now();

        mapIcon.save(function(err){
            if(err) return callback(err,null);
            MediaService.assign(mapIcon.mediaId,[],MediaVars.VISIBILITY_PUBLIC,mapIcon._id,"MapIcon#mediaId",function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, mapIcon);
                }
            })

        });
    });

}

service.findById = function (id,callback){
    MapIcon.findOne({_id:id},function(err,doc){
       callback(err,doc);
    });
}

service.removeById = function (id,callback){
    MapIcon.findOne({_id:id},function(err,doc){
        if(err) return callback(err);
        if(!doc) return callback("not found");
        doc.remove(callback);
        //TODO check if images can be removed if no one is using them (see Items)
    });
}


service.find = function(timestamp,callback){
    var query = {}
    if(timestamp){
        query.updated = {$gte:timestamp};
    }
    MapIcon.find(query)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

module.exports = {
    MapIcon: MapIcon,
    Service: service
};
