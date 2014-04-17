var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Feed = require("../models/feed").Feed
    , FeedService = require("../models/feed").Service
    , MAX_RESULTS_ITEMS = 100
    , MAX_LASTEST_ITEMS_SEEM = 5;


var itemSchema = new Schema({
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    replyTo:  {	type: Schema.Types.ObjectId, required: false, index: { unique: false, sparse: true }},
    replyCount: {type: Number, required:true, default:0},
    seemId: {	type: Schema.Types.ObjectId, required: false},
    depth : {type: Number, required:true, default:0},
    userId:   {	type: Schema.Types.ObjectId, required: false},
    username:{	type: String, required: false},
    favouriteCount:{type: Number, required:true, default:0}
});


var reducedItemSchema = new Schema({
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    replyTo:  {	type: Schema.Types.ObjectId, required: false},
    depth : {type: Number, required:true, default:0},
    userId:   {	type: Schema.Types.ObjectId, required: false},
    username:{	type: String, required: false}
});


var seemSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    updated         :   {   type: Date	, required: true, default: Date.now },
    itemId          :   {	type: Schema.Types.ObjectId, required: true},
    itemMediaId     :   {	type: Schema.Types.ObjectId, required: false},
    itemCaption     :   {	type: String, required: false},
    latestItems     :       [reducedItemSchema],
    title           :   {	type: String, required: false},
    itemCount       :   {   type: Number, required:true, default:1},
    userId          :   {	type: Schema.Types.ObjectId, required: false},
    username        :   {	type: String, required: false}
});

var favouriteSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    userId          :   {	type: Schema.Types.ObjectId, required: true},
    username        :   {	type: String, required: true},
    itemId          :   {	type: Schema.Types.ObjectId, required: true}
});


favouriteSchema.index({ itemId: 1,userId:1 }, { unique: true });
seemSchema.index({ itemId: 1 });
var Seem = mongoose.model('seem', seemSchema);
var Item = mongoose.model('item', itemSchema);
var Favourite = mongoose.model('favourite', favouriteSchema);


//Service?
var service = {};

service.create = function(title,caption,mediaId,user,callback){

    var mainItem = new Item();
    mainItem.mediaId = mediaId;
    mainItem.caption = caption;
    mainItem.userId = user._id;
    mainItem.username = user.username;

    mainItem.save(function(err){
        if(err) return callback(err);

        var seem = new Seem();
        seem.title = title;
        seem.itemId = mainItem._id;
        if(user) {
            seem.userId = user._id;
            seem.username = user.username;
        }
        seem.itemMediaId = mainItem.mediaId;
        seem.itemCaption = mainItem.caption;
        seem.latestItems.push(mainItem);

        seem.save(function(err){
            if(err){
                callback(err);
            } else {
                mainItem.seemId = seem._id;
                mainItem.save(function(err){
                    //TODO handle this error
                    if(err) return callback(err,null);

                    callback(null,seem);// ignore errors here

                    //Kind of background?
                    FeedService.onSeemCreated(seem,mainItem,user);

                });
            }
        });
    });
}

service.favourite = function(item,user,callback){

    var favourite = new Favourite();
    favourite.userId = user._id;
    favourite.username = user.username;
    favourite.itemId = item._id;
    favourite.save(function(err){
        if(err) return callback(err);

        Item.update({"_id": item._id},
            {$inc: {"favouriteCount": 1}},function(err){
                if(err) return callback(err);

                Seem.findOne({"_id":item.seemId},function(err,seem){
                    if(err) return callback(err);

                    callback();

                    FeedService.onFavourited(seem,item,user);

                });
            });

    })


}

service.unfavourite = function(item,user,callback){

    Favourite.findOne({"itemId":item._id,"userId":user._id},function(err,favourite){
        if(err) return callback(err);

        favourite.remove(function(err){
            if(err) return callback(err);
            Item.update({"_id": item._id},
                {$inc: {"favouriteCount": -1}},function(err){
                    callback(err);
                });

        });
    });
}

service.list = function(callback){
    Seem.find(function(err,seemObj){
        callback(err,seemObj);
    });
}

service.getItem = function(id,callback){
    Item.findOne({_id:id},function(err,seemObj){
        callback(err,seemObj);
    });
}

service.getItemReplies = function(id,page,callback){
    Item.find({replyTo:id}).sort({created: -1}).skip(page * MAX_RESULTS_ITEMS).limit(MAX_RESULTS_ITEMS).exec(function(err,docs){
        callback(err,docs);
    });
}

service.reply = function(replyId,caption,mediaId,user,callback){
    service.replyAux(replyId,caption,mediaId,replyId,1,user,null,callback);

}
service.replyAux = function(replyId,caption,mediaId,nextParent,depth,user,replyToObj,callback){
    Item.findOne({_id:nextParent},function(err,parentItem){
        if(err) return callback(err);
        if(!parentItem) return callback("parent reply not found");

        if(parentItem._id == replyId){
            replyToObj = parentItem;
        }

        if(parentItem.replyTo){
            service.replyAux(replyId,caption,mediaId,parentItem.replyTo,depth+1,user,replyToObj,callback);
        }else {
            //console.log("ParentItem "+parentItem._id+" Depth:"+depth);
            Seem.findOne({itemId:parentItem._id},function(err,seem){

                if (err) return callback(err)

                var item = new Item();
                item.mediaId = mediaId;
                item.caption = caption;
                item.replyTo = replyId;
                item.depth = depth;
                item.seemId = seem._id;
                if(user) {
                    item.userId = user._id;
                    item.username = user.username;
                }
                //----------------
                //Save Item
                //----------------
                item.save(function (err) {
                    if (err) return callback(err);
                    //----------------
                    //Update its parent
                    //----------------
                    Item.update({_id: replyId}, {$inc: {replyCount: 1}}, function (err) {
                        if (err) return callback(err);

                        // we just want to save some fields
                        var itemReduced = {};
                        itemReduced._id = item._id;
                        itemReduced.mediaId = item.mediaId;
                        itemReduced.depth = item.depth;
                        itemReduced.replyTo =  item.replyTo;
                        itemReduced.caption = item.caption;
                        itemReduced.userId = item.userId;
                        itemReduced.username = item.username;
                        itemReduced.created = item.created;

                        //----------------
                        //update Seem
                        //----------------
                        Seem.update({_id: seem._id},
                            {   $inc: {itemCount: 1},
                                $set:{updated:Date.now()},
                                $push: {latestItems: {
                                    $each: [itemReduced],
                                    $slice: -MAX_LASTEST_ITEMS_SEEM
                                }
                                }
                            }
                            ,
                            function (err) {
                                if (err) return callback(err);

                                callback(null, item);

                                FeedService.onReply(seem,item,replyToObj,user);
                            }
                        );
                    });
                });

            });
        }
    });
}

module.exports = {
    Favourite: Favourite,
    Seem: Seem,
    Item: Item,
    Service:service
};