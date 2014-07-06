var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , User = require("../models/user").User
    , Media = require("../models/media").Media
    , MediaService = require("../models/media").Service
    , MediaVars = require('../models/media')
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

inboxSchema.index({userId:1,itemId:1},{unique:true}); //just one item per user
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
                    callback();
                    createBackground(item);
                }
            });
        }else{
            callback();
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
                    var inbox = new Inbox();
                    inbox.userId = userId;
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
                    //TODO maybe send friend request?
                }

            });


        })
    }
}

service.open = function(itemId,longitude,latitude,userId,callback){
    Inbox.findOne({itemId:itemId},function(err,inbox){
        if(err) return callback(err);
        if(inbox && inbox.status == STATUS_OPENED){
            Item.findOne({_id:itemId},function(err,item){
                if(err) return callback(err);
                if(!item) return callback("Item not found ¿?");
                openItem(item,callback);
            });
        } else {

            var query =
                {_id:itemId,
                $or:
                    [
                        {openability:OPENABILITY_UNLIMITED},
                        {$and:
                            [
                                {openability:OPENABILITY_ONLY_ONCE},
                                {status:STATUS_UNOPENED}
                            ]
                        }
                    ]
                };

            var update = {
                            $set: { status: STATUS_OPENED },
                            $inc: { openedCount:1 }
                        };

            if(!inbox){
                query.visibility = VISIBILITY_PUBLIC;
            }

            Item.findOneAndUpdate(
                query,
                update,
                function(err,item) {
                    if (err) return callback(err);
                    if (!item) return callback("Item not found");

                    //FOUND
                    if (!inbox) {
                        inbox = new Inbox();
                        inbox.userId = userId;
                        inbox.itemId = item._id;
                        inbox.location = item.location;
                        inbox.radius = item.radius;
                        inbox.ownerUserId = item.ownerUserId;
                    }

                    inbox.status = STATUS_OPENED;
                    inbox.openedDate = Date.now();
                    inbox.save(function (err) {
                        if (err) return callback(err);
                        openItem(item, callback);
                    });


            });

        }
    });
}

function openItem(item,callback){
    callback(null,{mediaId:item.mediaId,message:item.message});
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