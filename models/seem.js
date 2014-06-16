var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
    , Media = require("../models/media").Media
    , EventService = require("../models/eventdispatcher.js").Service
    , MAX_RESULTS_ITEMS = 100
    , MAX_LASTEST_ITEMS_SEEM = 5
    , THUMB_SCORE_UP = 1
    , THUMB_SCORE_DOWN = -1
    , Utils = require('../utils/utils')
    , textSearch = require('mongoose-text-search')
    , CronJob = require('cron').CronJob
    , CONSTANT_DATE = 1377966600  // is a constant and a very special date :)
    , PUBLIC_USER_FIELDS ="username mediaId bio name"
    , PUBLISH_PERMISSIONS_EVERYONE="EVERYONE"
    , PUBLISH_PERMISSIONS_ONLY_ME="ONLY_ME"
    , PUBLISH_PERMISSIONS = [PUBLISH_PERMISSIONS_ONLY_ME,PUBLISH_PERMISSIONS_EVERYONE]
    , VIEW_PERMISSIONS_EVERYONE="EVERYONE"
    , VIEW_PERMISSIONS_EVERYONE_WITH_THE_LINK="EVERYONE_WITH_THE_LINK" //TODO
    , VIEW_PERMISSIONS = [VIEW_PERMISSIONS_EVERYONE,VIEW_PERMISSIONS_EVERYONE_WITH_THE_LINK]
    ;


var itemSchema = new Schema({
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    seemId: {	type: Schema.Types.ObjectId, required: true},
    replyTo: {	type: Schema.Types.ObjectId, required: false},
    user:   {	type: Schema.Types.ObjectId, required: false, ref:"User"},
    exifLocation: { type: [Number], required:false,index: '2dsphere'},
    tags: [String]
});



var seemSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    updated         :   {   type: Date	, required: true, default: Date.now },
    startDate       :   {   type: Date	, required: false},
    endDate         :   {   type: Date	, required: false},
    user            :   {	type: Schema.Types.ObjectId, required: false, ref: "User"},
    title           :   {	type: String, required: false},
    coverPhotoMediaId:  {	type: Schema.Types.ObjectId, required: false},
    publishPermissions         :   { type: String, enum: PUBLISH_PERMISSIONS,required:true, default:PUBLISH_PERMISSIONS_ONLY_ME},
    viewPermissions          :   { type: String, enum: VIEW_PERMISSIONS,required:true, default:VIEW_PERMISSIONS_EVERYONE},
    //
    itemCount       :   {   type: Number, required:true, default:0},
    tags: [String],
    latestItems     :       [itemSchema]
});


seemSchema.plugin(textSearch);
seemSchema.index({ title: 'text',tags:'text'});
seemSchema.index({created:-1});
seemSchema.index({updated:-1});
seemSchema.index({expire:-1});
Utils.joinToUser(seemSchema);

itemSchema.plugin(textSearch);
itemSchema.index({caption: 'text',tags:'text'});
itemSchema.index({seemId:1});
itemSchema.index({hotScore:-1,updated:-1});
itemSchema.index({viralScore:-1,updated:-1});
Utils.joinToUser(itemSchema);

var Seem = mongoose.model('Seem', seemSchema);
var Item = mongoose.model('Item', itemSchema);

//Service?
var service = {};

service.create = function(title,user,startDate,endDate,coverPhotoMediaId,publishPermissions,callback){
    var seem = new Seem();
    seem.title = title;
    seem.user = user._id;
    if(startDate) {
        seem.startDate = startDate;
    }
    if(endDate) {
        seem.endDate = endDate;
    }
    if(coverPhotoMediaId){
        seem.coverPhotoMediaId = coverPhotoMediaId;
    }
    if(publishPermissions){
        seem.publishPermissions = publishPermissions;
    }
    seem.tags = Utils.extractTags(" "+seem.title);

    seem.save(function(err){
        if(err){
            callback(err);
        } else {
            callback(null, seem);// ignore errors here

            //Kind of background?
            EventService.onSeemCreated(seem);
        }
    });
}

service.add = function(seemId,caption,mediaId,replyTo,user,callback){
    Media.findOne({_id:mediaId},function(err,media) {
        if(err){
            callback(err);
        }else if(!media){
            callback("Media not found");
        }else {
            Seem.findOne({_id:seemId},function(err,seem){
                if (err) return callback(err);

                if(seem.startDate && new Date().isBefore(seem.startDate)){
                    return callback(new NotStartedSeemError("Cannot add photos to a seem that has not started"))
                }
                if(seem.endDate && new Date().isAfter(seem.endDate)){
                    return callback(new EndedSeemError("Cannot add photos to an already expired seem"))
                }
                if(seem.publishPermissions == PUBLISH_PERMISSIONS_ONLY_ME && seem.user != user._id){
                    return callback(new InvalidPermissions("You don't have permissions to add to this seem"))
                }

                var item = new Item();
                item.caption = caption;
                item.seemId = seem._id;
                item.user = user._id;
                item.mediaId = media._id;
                if(replyTo){
                    item.replyTo = replyTo;
                }
                if(media.exifLocation){
                    item.exifLocation = media.exifLocation;
                }
                //----------------
                //Save Item
                //----------------
                item.save(function (err) {
                    if (err) return callback(err);

                    //----------------
                    //update Seem
                    //----------------
                    Seem.update({_id: seem._id},
                        {   $inc: {itemCount: 1},
                            $set:{updated:Date.now()},
                            $push: {latestItems: {
                                $each: [item],
                                $slice: -MAX_LASTEST_ITEMS_SEEM
                            }
                            }
                        }
                        ,
                        function (err) {
                            if (err) return callback(err);

                            var userUpdate = {$inc: {"published": 1}};
                            User.update({"_id": user._id},userUpdate
                                ,function(err) {
                                    if (err) return callback(err);

                                    callback(null, item);

                                    EventService.onItemAdded(item);
                                });
                        }
                    );
                });

            });
        }
    });
}

service.findItemConversationView = function(itemId,callback){
    var list = [];
    findItemConversationViewAux(itemId,list,callback);

}

function findItemConversationViewAux(itemId,list,callback){
    Item.findOne({_id:itemId})
        .populate('user',PUBLIC_USER_FIELDS)
        .exec(function(err,doc){
            list.unshift(doc);
            if(doc.replyTo){
                findItemConversationViewAux(doc.replyTo,list,callback);
            }else {
                callback(err, list);
            }
        });
}

service.findItemById = function(itemId,callback){
    Item.findOne({_id:itemId})
        .populate('user',PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

service.getSeemItems = function(seemId,page,callback){
    Item.find({seemId:seemId})
        .sort({created: -1})
        .skip(page * MAX_RESULTS_ITEMS)
        .limit(MAX_RESULTS_ITEMS)
        .populate('user',PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
        callback(err,docs);
    });
}


service.findByUpdated = function(page, callback){
    Seem.find({})
        .sort({updated:-1})
        .skip(page * MAX_RESULTS_ITEMS)
        .limit(MAX_RESULTS_ITEMS)
        .populate("user",PUBLIC_USER_FIELDS)
        .populate("latestItems.user",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

service.findByAboutToStart = function(page, callback){
    Seem.find({})
        .sort({startDate:1})
        .where('startDate').gt(Date.now())
        .skip(page * MAX_RESULTS_ITEMS)
        .limit(MAX_RESULTS_ITEMS)
        .populate("user",PUBLIC_USER_FIELDS)
        .populate("latestItems.user",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

service.findByAboutToEnd = function(page, callback){
    Seem.find({})
        .sort({endDate:-1})
        .where('endDate').gt(Date.now())
        .skip(page * MAX_RESULTS_ITEMS)
        .limit(MAX_RESULTS_ITEMS)
        .populate("user",PUBLIC_USER_FIELDS)
        .populate("latestItems.user",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

service.findByEnded = function(page, callback){
    Seem.find({})
        .sort({endDate:-1})
        .where('endDate').lt(Date.now())
        .skip(page * MAX_RESULTS_ITEMS)
        .limit(MAX_RESULTS_ITEMS)
        .populate("user",PUBLIC_USER_FIELDS)
        .populate("latestItems.user",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
            callback(err,docs);
        });
}

function EndedSeemError(message) {
    this.name = 'ExpiredSeem';
    this.message = message;
    this.stack = (new Error()).stack;
}
EndedSeemError.prototype = new Error;

function NotStartedSeemError(message) {
    this.name = 'NotStartedSeem';
    this.message = message;
    this.stack = (new Error()).stack;
}
NotStartedSeemError.prototype = new Error;

function InvalidPermissions(message) {
    this.name = 'InvalidPermissions';
    this.message = message;
    this.stack = (new Error()).stack;
}
InvalidPermissions.prototype = new Error;

module.exports = {
    Seem: Seem,
    Item: Item,
    Service:service,
    EndedSeemError:EndedSeemError,
    NotStartedSeemError:NotStartedSeemError,
    InvalidPermissions:InvalidPermissions
};