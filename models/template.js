var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var MediaService = require('../models/media').Service;
var MediaVars = require('../models/media');

var templateSchema = new Schema({
    name        :   { type: String, required: true},
    price       :   { type: Number, required:true},
    mediaId     :   { type: Schema.Types.ObjectId, required: true},
    teaserMediaId:   { type: Schema.Types.ObjectId, required: true},
    created     :   { type: Date, required: true, default: Date.now },
    updated     :   { type: Date, required: true, default: Date.now }
});

templateSchema.index({updated:-1});

var Template = mongoose.model('Template', templateSchema);


var service = {};

module.exports = {
    Template: Template,
    Service: service
};

// Avoid cyclic dependency after exports
var ItemUtils = require('../utils/itemhelper');

service.create = function (name,price,mediaId,userId,callback){
    var template = new Template();
    template.name = name;
    template.price = price;
    template.mediaId = mediaId;
    ItemUtils.generatePreviewTemplateImage(template,userId,function(err,template){
        if(err) return callback(err);
        template.save(function(err){
            if(err) return callback(err,null);
            MediaService.assign(template.teaserMediaId,[],MediaVars.VISIBILITY_PUBLIC,template._id,"Template#teaserMediaId",function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    MediaService.assign(template.mediaId, [], MediaVars.VISIBILITY_PUBLIC, template._id, "Template#mediaId", function (err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, template);
                        }
                    });
                }
            })

        });

    });
}

service.update = function (id,name,price,mediaId,userId,callback){
    Template.findOne({_id:id},function(err,template){
        if(err) return callback(err);

        template.name = name;
        template.price = price;
        template.mediaId = mediaId;
        template.updated = Date.now();
        //unassign teaserMediaId
        /*MediaService.findById(template.teaserMediaId,function(err,media){
            MediaService.remove(media,function(err){
                console.log("Removed Old Media")
            });
        })*/
        //Do not remove
        ItemUtils.generatePreviewTemplateImage(template,userId,function(err,template){
            if(err) return callback(err);
            template.save(function(err){
                if(err) return callback(err,null);
                MediaService.assign(template.teaserMediaId,[],MediaVars.VISIBILITY_PUBLIC,template._id,"Template#teaserMediaId",function(err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        MediaService.assign(template.mediaId, [], MediaVars.VISIBILITY_PUBLIC, template._id, "Template#mediaId", function (err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, template);
                            }
                        });
                    }
                })

            });

        });
    });

}

service.findById = function (id,callback){
    Template.findOne({_id:id},function(err,doc){
       callback(err,doc);
    });
}

service.removeById = function (id,callback){
    Template.findOne({_id:id},function(err,doc){
        if(err) return callback(err);
        if(!doc) return callback("not found");
        doc.remove(callback);
        //TODO check if images can be removed if no one is using them (see Items)
    });
}


service.findTemplates = function(timestamp,callback){
    var query = {}
    if(timestamp){
        query.updated = {$gte:timestamp};
    }
    Template.find(query)
        .exec(function(err,docs){
            callback(err,docs);
        });
}
