var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
    , Media = require("../models/media").Media
    , FriendService = require("../models/friend").Service
    , EventService = require("../models/eventdispatcher.js").Service
    , Utils = require('../utils/utils')
    , textSearch = require('mongoose-text-search')
    , CronJob = require('cron').CronJob
    , CONSTANT_DATE = 1377966600  // is a constant and a very special date :)
    , PUBLIC_USER_FIELDS = require("../models/user").PUBLIC_USER_FIELDS
    , OPENABILITY_ONLY_ONCE = 0
    , OPENABILITY_UNLIMITED = 1
    , OPENABILITY = [OPENABILITY_ONLY_ONCE,OPENABILITY_UNLIMITED]
    , TYPE_MESSAGE = 0
    , TYPE_IMAGE = 1
    , TYPE_VIDEO = 2
    , TYPES = [TYPE_MESSAGE,TYPE_IMAGE,TYPE_VIDEO]
    , STATUS_UNOPENED = 0
    , STATUS_OPENED = 1
    , STATUS_EXPIRED = 2
    , STATUS = [STATUS_UNOPENED,STATUS_OPENED,STATUS_EXPIRED]
    , VISIBILITY_PRIVATE = 0
    , VISIBILITY_PUBLIC = 1
    , VISIBILITY = [VISIBILITY_PRIVATE,VISIBILITY_PUBLIC]
    ;


var itemSchema = new Schema({
    type        :   { type: Number, enum: TYPES,required:true, default:TYPE_MESSAGE},
    ownerUserId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    created     :   { type: Date	, required: true, default: Date.now },
    message     :   { type: String, required: false},
    mediaId     :   { type: Schema.Types.ObjectId, required: false},
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true},
    openability :   { type: Number, enum: OPENABILITY,required:true, default:OPENABILITY_UNLIMITED },
    status      :   { type: Number, enum: STATUS,required:true, default:STATUS_UNOPENED },
    visibility  :   { type: Number, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE },
    openedCount :   { type: Number, required:true, default:0},
    to          :   [Schema.Types.ObjectId] //users, no users = public


});

itemSchema.index({ownerUserId:1});
itemSchema.index({created:-1});
itemSchema.index({radius:-1});
itemSchema.index({status:1});

var Item = mongoose.model('Item', itemSchema);

var inboxSchema = new Schema({
    userId      :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    ownerUserId :   { type: Schema.Types.ObjectId, required: true, ref:"User"},
    itemId      :   { type: Schema.Types.ObjectId, required: true, ref:"Item"},
    created     :   { type: Date	, required: true, default: Date.now },
    openedDate  :   { type: Date	, required:false },
    location    :   { type: [Number], required:true,index: '2dsphere'},
    radius      :   { type: Number, required:true},
    status      :   { type: Number, enum: STATUS,required:true, default:STATUS_UNOPENED }
});

inboxSchema.index({userId:1,openedDate:-1});
inboxSchema.index({itemId:1});
inboxSchema.index({status:1});
inboxSchema.index({radius:-1});

var Inbox = mongoose.model('Inbox', inboxSchema);

//Service?
var service = {};

service.create = function(type,message,mediaId,latitude,longitude,radius,openability,to,ownerUserId,callback){
    var item = new Item();
    item.type = type;
    item.message = message;
    item.mediaId = mediaId;
    item.location = [latitude,longitude]; //TODO maybe the opposite
    item.radius = radius;
    item.openability = openability;
    item.to = to;
    item.ownerUserId = ownerUserId;

    if(item.type == TYPE_MESSAGE){
        delete item.mediaId;
    } else if ( (item.type == TYPE_IMAGE || item.type == TYPE_VIDEO) && !item.type ){
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
        callback(err);

        //We return to the user but we keep working on the "background"

        //Send and notify users
        if(item.to){
            item.to.forEach(function(userId){
                //Check friendship!
                FriendService.isFriend(userId,item.ownerUserId,function(err,isFriend){
                   if(err){
                        console.error(err);
                   }else if(isFriend){
                       var inbox = new Inbox();
                       indox.userId = userId;
                       inbox.itemId = item._id;
                       inbox.location = item.location;
                       inbox.radius = item.radius;
                       inbox.ownerUserId = item.ownerUserId;
                       inbox.save(function(err){
                           if(err){
                               console.error(err);
                           }else{
                               EventService.onInboxCreated(inbox);
                           }
                       })
                   } else {
                       //¿?
                   }

                });


            })
        }

    })
}


///Old Stuff
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