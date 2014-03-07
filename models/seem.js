var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , VISIBILITY_PUBLIC = "public"
  , VISIBILITY_PRIVATE = "private";

var seemItemCommentSchema = new Schema({
    userId  : {	type: Schema.Types.ObjectId, required: true},
    comment : {	type: String , required: true},
    created : { type: Date	, required: true, default: Date.now }
});

var seemItemSchema = new Schema({
    userId  : {	type: Schema.Types.ObjectId, required: true},
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    comments: [seemItemCommentSchema]
});

var seemParticipantSchema =  new Schema({
    userId  : {	type: Schema.Types.ObjectId, required: true},
    invited : { type: Date	, required: true, default: Date.now },
    quited : { type: Date	, required: false}
});

var seemSchema = new Schema({
    ownerId	    : {	type: Schema.Types.ObjectId, required: true}
  , participants : [seemParticipantSchema]
  , created		    : { type: Date	, required: true, default: Date.now }
  , modified	    : { type: Date	, required: true, default: Date.now }
  , visibility      : { type: String, required: true}
  , title           : { type: String, required: true}
  , items: [seemItemSchema]
});



var Seem = mongoose.model('seem', seemSchema);

//Service?
var service = {};

service.create = function(user,title,visibility,callback){
    var seem = new Seem();
    seem.ownerId = user._id;
    seem.visibility = visibility;
    seem.title = title;
    seem.save(function(err){
        if(err){
            callback(err);
        } else {
            callback(null,seem);
        }
    });

}

service.findById = function(id,callback){
    Seem.findOne({"_id":id},function(err,seemObj){
        if(err){
            callback(err);
        } else {
            callback(null,seemObj);
        }
    });
}


module.exports = {
  Seem: Seem,
  Service:service
};