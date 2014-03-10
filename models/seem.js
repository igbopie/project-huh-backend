var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/*
var seemItemCommentSchema = new Schema({
    userId  : {	type: Schema.Types.ObjectId, required: true},
    comment : {	type: String , required: true},
    created : { type: Date	, required: true, default: Date.now }
});*/

var replySchema = new Schema({
    userId  : {	type: Schema.Types.ObjectId, required: true},
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false}
});
/*
var seemParticipantSchema =  new Schema({
    userId  : {	type: Schema.Types.ObjectId, required: true},
    invited : { type: Date	, required: true, default: Date.now },
    left : { type: Date	, required: false}
});
*/
var seemSchema = new Schema({
    ownerId	    : {	type: Schema.Types.ObjectId, required: true}
  , created		    : { type: Date	, required: true, default: Date.now }
  , modified	    : { type: Date	, required: true, default: Date.now }
  , mediaId : {	type: Schema.Types.ObjectId, required: true}
  , caption : {	type: String, required: false}
  , replies: [replySchema]
});



var Seem = mongoose.model('seem', seemSchema);

//Service?
var service = {};

service.create = function(user,caption,mediaId,callback){

    var seem = new Seem();
    seem.ownerId = user._id;
    seem.mediaId = mediaId;
    seem.caption = caption;
    seem.save(function(err){
        if(err){
            callback(err);
        } else {
            callback(null,seem);
        }
    });

}
service.reply = function(seem,user,caption,mediaId,callback){

    var seemReply = {};
    seemReply.userId = user._id;
    seemReply.caption = caption;
    seemReply.mediaId = mediaId;

    seem.replies.push(seemReply);

    seem.save(function(err){
        callback(err);
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