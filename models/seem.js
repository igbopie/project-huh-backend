var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , Feed = require("../models/feed").Feed
    , FeedService = require("../models/feed").Service
    , MAX_RESULTS_ITEMS = 100
    , MAX_LASTEST_ITEMS_SEEM = 5
    , THUMB_SCORE_UP = 1
    , THUMB_SCORE_DOWN = -1
    , Utils = require('../utils/utils')
    , textSearch = require('mongoose-text-search')
    , CronJob = require('cron').CronJob;


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
    favouriteCount:{type: Number, required:true, default:0},
    thumbUpCount:{type: Number, required:true, default:0},
    thumbDownCount:{type: Number, required:true, default:0},
    thumbScoreCount:{type: Number, required:true, default:0},
    tags: [String],
    favourited: { type: Boolean , required: false },//TRANSIENT!!! DO NOT PERSIST
    thumbedUp: { type: Boolean , required: false },//TRANSIENT!!! DO NOT PERSIST
    thumbedDown: { type: Boolean , required: false }//TRANSIENT!!! DO NOT PERSIST
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
    username        :   {	type: String, required: false},
    topicId         :   {	type: Schema.Types.ObjectId, required: false},
    tags: [String],
    hotScore        :   {	type: Number, required: false}
});

var favouriteSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    userId          :   {	type: Schema.Types.ObjectId, required: true},
    username        :   {	type: String, required: true},
    itemId          :   {	type: Schema.Types.ObjectId, required: true}
});

var thumbSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    userId          :   {	type: Schema.Types.ObjectId, required: true},
    username        :   {	type: String, required: true},
    itemId          :   {	type: Schema.Types.ObjectId, required: true},
    score           :   {   type: Number, required:true, default:1} //1 UP, -1 DOWN
});


var topicSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    name            : {	type: String, required: true,index: { unique: true }},
    code            : {	type: String, required: true,index: { unique: true }}
});


favouriteSchema.index({ itemId: 1,userId:1 }, { unique: true });
thumbSchema.index({ itemId: 1,userId:1 }, { unique: true });
seemSchema.index({ itemId: 1 });
seemSchema.index({ topicId: 1 });

seemSchema.plugin(textSearch);
seemSchema.index({ title: 'text' ,itemCaption:'text',tags:'text'});
seemSchema.index({hotScore:-1,created:-1});

itemSchema.plugin(textSearch);
itemSchema.index({caption: 'text',tags:'text'});



    var Seem = mongoose.model('seem', seemSchema);
var Item = mongoose.model('item', itemSchema);
var Favourite = mongoose.model('favourite', favouriteSchema);
var Thumb = mongoose.model('thumb', thumbSchema);
var Topic = mongoose.model('topic', topicSchema);

function onStartCheck(){
    var topics = [
        {name:"Animals",code:"animals"},
        {name:"Art",code:"art"},
        {name:"Comedy",code:"comedy"},
        {name:"Do it yourself",code:"diy"},
        {name:"Family",code:"family"},
        {name:"Food",code:"food"},
        {name:"Music",code:"music"},
        {name:"Dance",code:"dance"},
        {name:"News",code:"news"},
        {name:"Places",code:"places"},
        {name:"Science and Technology",code:"sci-tech"},
        {name:"Sports",code:"sports"},
        {name:"Style",code:"style"},
        {name:"Seem Tests",code:"seem-tests"},
        {name:"Selfie",code:"selfie"}
    ];

    topics.forEach(function(topicString){
        Topic.findOne({"code":topicString.code},function(err,topic){
            if(err){
                console.log("Error checking topics:"+err);
            } else if(topic){
                console.log("Topic found");
            } else {
                console.log("Topic not found... creating: "+topicString);
                topic = new Topic();
                topic.name = topicString.name;
                topic.code = topicString.code;
                topic.save(function(err){
                    if(err){
                        console.log("Error saving topic:"+err);
                    }else {
                        console.log("Created "+topicString);
                    }
                });
            }
        });
    });

}
onStartCheck();

//CRON

var job = new CronJob({
    cronTime: '0 */10 * * * *',
    onTick: function() {
        console.log("CRON!")
        var stream = Seem.find().stream();

        stream.on('data', function (doc) {
            // do something with the mongoose document
            hotness(doc);
        }).on('error', function (err) {
            // handle the error
        }).on('close', function () {
            // the stream is closed
        });
    },
    start: false,
    timeZone: "America/Los_Angeles"
});
job.start();


function hotness(seem){
    //load main Item
    Item.findOne({_id:seem.itemId},function(err,item){
        var s = item.thumbScoreCount;

        var y;
        if(s > 0){
            y = 1;
        } else if(s < 0){
            y = -1;
        } else {
            y = 0;
        }
        // 1377966600 is a constant and a very special date :)
        var seconds = (seem.created.getTime() *1000) - 1377966600;

        var z = Math.abs(s);
        if(z >= 1){
            z = z;
        } else {
            z = 1;
        }

        var hotnessValue = log10(z) + (y * seconds / 45000);
        console.log(hotnessValue+" "+s);

        seem.hotScore = hotnessValue;
        seem.save(function(err){
            if(err){
                console.error(err);
            }
        })

    })
}
function log10(val) {
    return Math.log(val) / Math.log(10);
}

//Service?
var service = {};

service.create = function(title,caption,mediaId,topicId,user,callback){
    if(topicId) {
        Topic.findOne({"_id": topicId}, function (err, topic) {
            //ignore errors here just log it
            if (err) {
                console.error(err);
            }
            createSeemAux(title, caption, mediaId, topic, user, callback);
        })
    }else{
        createSeemAux(title, caption, mediaId, null, user, callback);
    }


}

function createSeemAux(title,caption,mediaId,topic,user,callback){
    var mainItem = new Item();
    mainItem.mediaId = mediaId;
    mainItem.caption = caption;
    mainItem.userId = user._id;
    mainItem.username = user.username;
    mainItem.tags = Utils.extractTags(mainItem.caption);

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

        if(topic){
            seem.topicId = topic._id
        }
        seem.latestItems.push(mainItem);

        //this way we don't get repeated tags
        seem.tags = Utils.extractTags(mainItem.caption+" "+seem.title);

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
service.thumbUp = function(item,user,callback){
    //
    Thumb.findOne({"itemId":item._id,"userId":user._id},function(err,thumb){
        if(err) return callback(err);

        //Standard update
        var incUpdate = {$inc: {"thumbUpCount": 1,"thumbDownCount": 0,"thumbScoreCount": 1}};
        if(thumb){
            if (thumb.score == THUMB_SCORE_UP) {
                //DO NOTHING
                return callback();
            } else {
                incUpdate = {$inc: {"thumbUpCount": 1,"thumbDownCount": -1,"thumbScoreCount": 2}};
            }
        } else {
            var thumb = new Thumb();
            thumb.userId = user._id;
            thumb.username = user.username;
            thumb.itemId = item._id;
        }

        thumb.score = THUMB_SCORE_UP;

        thumb.save(function(err){
            if(err) return callback(err);

            Item.update({"_id": item._id},incUpdate
                ,function(err){
                    if(err) return callback(err);

                    Seem.findOne({"_id":item.seemId},function(err,seem){
                        if(err) return callback(err);

                        callback();

                        FeedService.onThumbUp(seem,item,user);

                    });
                });
        })
    });
}

service.thumbDown = function(item,user,callback){
    //
    Thumb.findOne({"itemId":item._id,"userId":user._id},function(err,thumb){
        if(err) return callback(err);

        //Standard update
        var incUpdate = {$inc: {"thumbUpCount": 0,"thumbDownCount": 1,"thumbScoreCount": -1}};
        if(thumb){
            if (thumb.score == THUMB_SCORE_DOWN) {
                //DO NOTHING
                return callback();
            } else {
                incUpdate = {$inc: {"thumbUpCount": -1,"thumbDownCount": 1,"thumbScoreCount": -2}};
            }
        } else {
            var thumb = new Thumb();
            thumb.userId = user._id;
            thumb.username = user.username;
            thumb.itemId = item._id;
        }

        thumb.score = THUMB_SCORE_DOWN;

        thumb.save(function(err){
            if(err) return callback(err);

            Item.update({"_id": item._id},incUpdate
                ,function(err){
                    if(err) return callback(err);

                    Seem.findOne({"_id":item.seemId},function(err,seem){
                        if(err) return callback(err);

                        callback();

                        FeedService.onThumbDown(seem,item,user);

                    });
                });
        })
    });
}

service.thumbClear = function(item,user,callback){
    //
    Thumb.findOne({"itemId":item._id,"userId":user._id},function(err,thumb){
        if(err) return callback(err);
        if(!thumb) return callback();

        //Standard update
        var incUpdate;
        if (thumb.score == THUMB_SCORE_UP) {
            incUpdate = {$inc: {"thumbUpCount": -1,"thumbDownCount": 0,"thumbScoreCount": -1}};
        } else {
            incUpdate = {$inc: {"thumbUpCount": 0,"thumbDownCount": -1,"thumbScoreCount": 1}};
        }

        thumb.remove(function(err){
            if(err) return callback(err);

            Item.update({"_id": item._id},incUpdate
                ,function(err){
                    if(err) return callback(err);

                    callback();
                });
        })
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

service.listTopics = function(callback){
    Topic.find().exec(function(err,docs){
        callback(err,docs);
    });
}

service.searchSeem = function(text,callback){
    var options = {
        //project: {}           // do not include the `created` property
        //, filter: { likes: { $gt: 1000000 }} // casts queries based on schema
        limit: 20
        , language: 'english'
        , lean: true
    }

    Seem.textSearch(text, options,  function (err, output) {
        if (err) return callback(err);

        console.log(output);

        var results = [];
        for(var i = 0;i<output.results.length;i++){
            results.push(output.results[i].obj);
        }
        callback(null,results);

    });
}

service.searchItems = function(text,callback){
    var options = {
        //project: {}           // do not include the `created` property
        //, filter: { likes: { $gt: 1000000 }} // casts queries based on schema
        limit: 20
        , language: 'english'
        , lean: true
    }

    Item.textSearch(text, options,  function (err, output) {
        if (err) return callback(err);

        var results = [];
        for(var i = 0;i<output.results.length;i++){
            results.push(output.results[i].obj);
        }
        callback(null,results);

    });
}

service.findByTopic = function(topicId,page,callback){
    Seem.find({topicId:topicId}).sort({hotScore:-1,created:-1}).skip(page * MAX_RESULTS_ITEMS).limit(MAX_RESULTS_ITEMS).exec(function(err,docs){
        callback(err,docs);
    });
}

service.findByHotness = function(page, callback){
    Seem.find({}).sort({hotScore:-1,created:-1}).skip(page * MAX_RESULTS_ITEMS).limit(MAX_RESULTS_ITEMS).exec(function(err,docs){
        callback(err,docs);
    });
}



module.exports = {
    Thumb: Thumb,
    Favourite: Favourite,
    Seem: Seem,
    Item: Item,
    Service:service
};