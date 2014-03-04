var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	dateUtils = require('date-utils')
  , Utils = require('../utils/utils')
  , SIZE_LIMIT = 20
  , gm = require('gm')
  , imageMagick = gm.subClass({ imageMagick: true })
  , fs = require('fs')
  , temp = require('temp').track()
  , AWS = require('aws-sdk')
  , s3 = new AWS.S3()
  , S3_BUCKET = process.env.AWS_S3_BUCKET
  , FORMAT_THUMB = {name:"thumb",height:50,width:50}
  , FORMAT_LARGE = {name:"large",height:500,width:500};
;



var mediaSchema = new Schema({
	ownerId			: {	type: Schema.Types.ObjectId, required: true, index: { unique: false}}
  , created			: { type: Date	, required: true, default: Date.now }
  , name            : { type: String	, required: true}
  , location		: { type: String	, required: false }
  , contentType		: { type: String	, required: true }
 
 });


var Media = mongoose.model('media', mediaSchema);

//Service?
var service = {};

service.get = function(id,formatName,callback){
    Media.findOne({"_id":id},function(err,media){
        if(err) {
            callback(err);
        }else if (media == null){
            callback(null,null);
        }else {
            var file = temp.createWriteStream();
            var params = {Bucket: S3_BUCKET, Key: media._id+"_"+formatName+"_"+media.name};

            s3.getObject(params).
                on('httpData', function(chunk) {
                    file.write(chunk);
                }).
                on('httpDone', function() {
                    file.on('close', function() {
                        //If you don't do this in a event then the size would be incorrect
                        media.tempPath = file.path;
                        callback(null,media);
                    });
                    file.end();
                }).
                send();
        }
    });
};

service.create = function(originalPath,contentType,name,ownerId,callback){
    var media = new Media();
    media.ownerId = ownerId;
    media.contentType = contentType;
    media.name = name;
    //TODO
    media.location = "NOT IMPLEMENTED";

    media.save(function(err){
        if(err){
            callback(err);
        } else {
            service.createAux(originalPath,media,FORMAT_THUMB,function(err){
                if(err){
                    callback(err);
                }else{
                    service.createAux(originalPath,media,FORMAT_LARGE,function(err){
                        if(err){
                            callback(err);
                        }else{
                            callback(null,media._id);
                        }
                    });
                }
            })
        }
    });
}
/**
 * Store format image in S3
 */
service.createAux = function(originalPath,media,format,callback){
    var tempPath = temp.path();
    imageMagick(originalPath)
        .resize(format.width, format.height)
        .write(tempPath, function (err) {
            if (err){
                callback(err);
            } else{
                var bodyStream = fs.createReadStream(tempPath);

                var params = {
                    Bucket          : S3_BUCKET,
                    Key             : ""+media._id+"_"+format.name+"_"+media.name,
                    Body          : bodyStream,
                    ContentType: media.contentType
                };

                s3.putObject(params, function(err, data) {
                    if(err){
                        //TODO remove image from db
                        callback(err);
                    } else{
                        //there's an e-tag but I am not going to do anything with it.
                        callback(null);
                    }
                });
            }
        });
}

module.exports = {
  Media: Media,
  Service:service
};