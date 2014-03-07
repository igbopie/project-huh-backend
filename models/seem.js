var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

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



var seem = mongoose.model('seem', seemSchema);

//Service?
var service = {};



module.exports = {
  Seem: seem,
  Service:service
};