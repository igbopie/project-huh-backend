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
    ;


var itemSchema = new Schema({
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    seemId: {	type: Schema.Types.ObjectId, required: false},
    user:   {	type: Schema.Types.ObjectId, required: false, ref:"User"},
    exifLocation: { type: [Number], required:false,index: '2dsphere'},
    tags: [String]
});



var seemSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    updated         :   {   type: Date	, required: true, default: Date.now },
    expire          :   {   type: Date	, required: true},
    user          :   {	type: Schema.Types.ObjectId, required: false, ref: "User"},
    title           :   {	type: String, required: false},
    //
    itemCount       :   {   type: Number, required:true, default:1},
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

service.create = function(title,user,expire,callback){
    var seem = new Seem();
    seem.title = title;
    seem.user = user._id;
    seem.expire = expire;
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

service.add = function(seemId,caption,mediaId,user,callback){
    Media.findOne({_id:mediaId},function(err,media) {
        if(err){
            callback(err);
        }else if(!media){
            callback("Media not found");
        }else {
            Seem.findOne({_id:seemId},function(err,seem){
                if (err) return callback(err)

                var item = new Item();
                item.caption = caption;
                item.seemId = seem._id;
                item.user = user._id;
                item.mediaId = media._id;
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



service.findByExpire = function(page, callback){
    Seem.find({})
        .sort({expire:-1})
        .skip(page * MAX_RESULTS_ITEMS)
        .limit(MAX_RESULTS_ITEMS)
        .populate("user",PUBLIC_USER_FIELDS)
        .populate("latestItems.user",PUBLIC_USER_FIELDS)
        .exec(function(err,docs){
        callback(err,docs);
    });
}


module.exports = {
    Seem: Seem,
    Item: Item,
    Service:service
};