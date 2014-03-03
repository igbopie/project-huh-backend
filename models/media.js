var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	dateUtils = require('date-utils')
  , Utils = require('../utils/utils')
  , SIZE_LIMIT = 20;



var mediaSchema = new Schema({
	ownerId			: {	type: Schema.Types.ObjectId, required: true, index: { unique: false}}
  , created			: { type: Date	, required: true, default: Date.now }
  , name            : { type: String	, required: true}
  , originalURL		: { type: String	, required: true}
  , largeURL		: { type: String	, required: true}
  , thumbURL		: { type: String	, required: true}
  , dimensions		: { type: String	, required: false }
  , location		: { type: String	, required: false }
  , contentType		: { type: String	, required: true }
  , size 			: { type: Number	, required: true }
 
 });


var media = mongoose.model('media', mediaSchema);

//Service?
var service = {};

service.findMediaById = function(id,callback){
    media.findOne({"_id":id},function(err,media){
        if(err) {
            callback(err);
        } else {
            callback(null,media);
        }
    });
};

module.exports = {
  Media: media,
  Service:service
};