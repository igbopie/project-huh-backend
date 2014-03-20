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
    replyCount: {type: Number, required:true, default:0}
});


var m1seemSchema = new Schema({
    created		    : { type: Date	, required: true, default: Date.now },
    itemId            : {	type: Schema.Types.ObjectId, required: true},
    title           : {	type: String, required: false}
});



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
                callback(null,seem);
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
    M1Item.findOne({_id:replyId},function(err,parentItem){
        if(err) return callback(err);
        if(!parentItem) return callback("parent reply not found");

        var item = new M1Item();
        item.mediaId = mediaId;
        item.caption = caption;
        item.replyTo = parentItem._id;

        item.save(function(err){
            if(err) return callback(err)
            M1Item.update({_id:parentItem._id}, {$inc : {replyCount : 1}}, function(err){
                callback(err,item);
            });
        });
    });
}

module.exports = {
  M1Seem: M1Seem,
  M1Item: M1Item,
  Service:service
};