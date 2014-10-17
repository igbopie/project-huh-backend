var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var MediaService = require('../models/media').Service;
var MediaVars = require('../models/media');

var mapiconSchema = new Schema({
    name        :   { type: String, required: true},
    tag       :   { type: String, required:false},
    mediaId     :   { type: Schema.Types.ObjectId, required: true},
    created     :   { type: Date, required: true, default: Date.now },
    updated     :   { type: Date, required: true, default: Date.now },
    groupId  :   { type: Schema.Types.ObjectId, required: false, ref:"MapIconGroup"}
});

mapiconSchema.index({updated:-1});

var MapIcon = mongoose.model('MapIcon', mapiconSchema);

var mapiconGroupSchema = new Schema({
    name        :   { type: String, required: true},
    mediaId     :   { type: Schema.Types.ObjectId, required: true},
    created     :   { type: Date, required: true, default: Date.now },
    updated     :   { type: Date, required: true, default: Date.now }
});

mapiconGroupSchema.index({updated:-1});

var MapIconGroup = mongoose.model('MapIconGroup', mapiconGroupSchema);


var service = {};

service.create = function (name,tag,mediaId,groupId,callback){
    var mapIcon = new MapIcon();
    mapIcon.name = name;
    mapIcon.tag = tag;
    mapIcon.mediaId = mediaId;
    if(groupId){
    mapIcon.groupId = groupId;
    }
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

service.createGroup = function (name,mediaId,callback){
    var mapIcon = new MapIconGroup();
    mapIcon.name = name;
    mapIcon.mediaId = mediaId;
    mapIcon.save(function(err){
        if(err) return callback(err,null);
        MediaService.assign(mapIcon.mediaId,[],MediaVars.VISIBILITY_PUBLIC,mapIcon._id,"MapIconGroup#mediaId",function(err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, mapIcon);
            }
        })

    });
}


service.update = function (id,name,tag,mediaId,groupId,callback){
    MapIcon.findOne({_id:id},function(err,mapIcon){
        if(err) return callback(err);

        mapIcon.name = name;
        mapIcon.tag = tag;
        mapIcon.mediaId = mediaId;
        mapIcon.updated = Date.now();
        if(groupId){
            mapIcon.groupId = groupId;
        }
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


service.updateGroup = function (id,name,mediaId,callback){
    MapIconGroup.findOne({_id:id},function(err,mapIcon){
        if(err) return callback(err);

        mapIcon.name = name;
        mapIcon.mediaId = mediaId;
        mapIcon.updated = Date.now();

        mapIcon.save(function(err){
            if(err) return callback(err,null);
            MediaService.assign(mapIcon.mediaId,[],MediaVars.VISIBILITY_PUBLIC,mapIcon._id,"MapIconGroup#mediaId",function(err) {
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

service.findGroupById = function (id,callback){
    MapIconGroup.findOne({_id:id},function(err,doc){
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
service.removeGroupById = function (id,callback){
    MapIconGroup.findOne({_id:id},function(err,doc){
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


service.findGroups = function(timestamp,callback){
    var query = {}
    if(timestamp){
        query.updated = {$gte:timestamp};
    }
    MapIconGroup.find(query)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

module.exports = {
    MapIcon: MapIcon,
    Service: service
};
