var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , MAX_RESULTS_ITEMS = 100;

/**
 * THIS IS A QUICK AND DIRTY BACKEND FOR TESTING THE USER EXPERIENCE
 * IT WILL NOT SCALE!! IT WILL NOT WORK WELL WITH BIG NUMBERS
 * @type {Schema}
 */

var m1itemSchema = new Schema({
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    replyTo:  {	type: Schema.Types.ObjectId, required: false, index: { unique: false, sparse: true }},
    replyCount: {type: Number, required:true, default:0},
    seemId: {	type: Schema.Types.ObjectId, required: false},
    depth : {type: Number, required:true, default:0}
});


var m1seemSchema = new Schema({
    created		    : { type: Date	, required: true, default: Date.now },
    itemId            : {	type: Schema.Types.ObjectId, required: true},
    title           : {	type: String, required: false},
    itemCount       : {type: Number, required:true, default:0}
});


m1seemSchema.index({ itemId: 1 });

var M1Seem = mongoose.model('m1seem', m1seemSchema);
var M1Item = mongoose.model('m1item', m1itemSchema);


//Service?
var service = {};

service.create = function(title,caption,mediaId,callback){

    var mainItem = new M1Item();
    mainItem.mediaId = mediaId;
    mainItem.caption = caption;


    mainItem.save(function(err){
        if(err) return callback(err);

        var seem = new M1Seem();
        seem.title = title;
        seem.itemId = mainItem._id;

        seem.save(function(err){
            if(err){
                callback(err);
            } else {
                mainItem.seemId = seem._id;
                mainItem.save(function(err){
                    callback(null,seem);
                });
            }
        });
    });
}

service.list = function(callback){
    M1Seem.find(function(err,seemObj){
        callback(err,seemObj);
    });
}

service.getItem = function(id,callback){
    M1Item.findOne({_id:id},function(err,seemObj){
        callback(err,seemObj);
    });
}

service.getItemReplies = function(id,page,callback){
    M1Item.find({replyTo:id}).sort({created: -1}).skip(page * MAX_RESULTS_ITEMS).limit(MAX_RESULTS_ITEMS).exec(function(err,docs){
        callback(err,docs);
    });
}

service.reply = function(replyId,caption,mediaId,callback){
    service.replyAux(replyId,caption,mediaId,replyId,1,callback);

}
service.replyAux = function(replyId,caption,mediaId,nextParent,depth,callback){
    M1Item.findOne({_id:nextParent},function(err,parentItem){
        if(err) return callback(err);
        if(!parentItem) return callback("parent reply not found");

        if(parentItem.replyTo){
            service.replyAux(replyId,caption,mediaId,parentItem.replyTo,depth+1,callback);
        }else {
            console.log("ParentItem "+parentItem._id+" Depth:"+depth);
            M1Seem.findOne({itemId:parentItem._id},function(err,seem){

                if (err) return callback(err)

                var item = new M1Item();
                item.mediaId = mediaId;
                item.caption = caption;
                item.replyTo = replyId;
                item.depth = depth;
                item.seemId = seem._id;

                item.save(function (err) {
                    if (err) return callback(err)
                    M1Item.update({_id: parentItem._id}, {$inc: {replyCount: 1}}, function (err) {
                        M1Seem.update({itemId: parentItem._id}, {$inc: {itemCount: 1}}, function (err) {
                            callback(err, item);
                        });
                    });
                });

            });
        }
    });
}

module.exports = {
    M1Seem: M1Seem,
    M1Item: M1Item,
    Service:service
};