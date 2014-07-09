var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , dateUtils = require('date-utils')
    , Utils = require('../utils/utils')
    , SIZE_LIMIT = 20
    , gm = require('gm')
    , imageMagick = gm.subClass({ imageMagick: true })
    , fs = require('fs')
    , temp = require('temp').track()
    , AWS = require('aws-sdk')
    , s3 = new AWS.S3()
    , S3_BUCKET = process.env.AWS_S3_BUCKET
    , CronJob = require('cron').CronJob
    , FORMAT_THUMB = {name: "thumb", height: 480, width: 480}//this is to make height 360 in a 4:3 format, 640 if we what 16:9
    , FORMAT_LARGE = {name: "large", height: 1920, width: 1920}
    , QUALITY = 5
    , VISIBILITY_PUBLIC = "PUBLIC"
    , VISIBILITY_PRIVATE = "PRIVATE"
    , VISIBILITY = [VISIBILITY_PUBLIC,VISIBILITY_PRIVATE]
    , UPLOAD_STATUSES_UPLOADED = "UPLOADED"
    , UPLOAD_STATUSES_ASSIGNED = "ASSIGNED"
    , UPLOAD_STATUSES = [UPLOAD_STATUSES_UPLOADED,UPLOAD_STATUSES_ASSIGNED]
    ;

/* Lifecicle: Upload -> UPLOADED, then assign. If not assigned, the media can be cleaned by a "garbage collector" TODO */
var mediaSchema = new Schema({
    ownerId     :   { type: Schema.Types.ObjectId, required: true},
    created     :   { type: Date, required: true, default: Date.now },
    name        :   { type: String, required: true},
    contentType :   { type: String, required: true },
    exifLocation:   { type: [Number], required:false,index: '2dsphere'},
    canView     :   [Schema.Types.ObjectId], //userIds
    visibility  :   { type: String, enum: VISIBILITY,required:true, default:VISIBILITY_PRIVATE},
    uploadStatus:   { type: String, enum: UPLOAD_STATUSES,required:true, default:UPLOAD_STATUSES_UPLOADED},
    entityRefId   :   { type: Schema.Types.ObjectId, required: false},
    entityRefName:{ type: String, required: false} //Entity#Property -> User#mediaId
});

mediaSchema.index({ ownerId: 1 });
mediaSchema.index({ uploadStatus: 1 });
var Media = mongoose.model('media', mediaSchema);


var mediaGcJob = new CronJob({
    cronTime: '0 0 0 * * *',
    onTick: function() {
        console.log("CRON!");

        mediaGcJobS3Clean();
        mediaJobCleanDb();

    },
    start: false,
    timeZone: "America/Los_Angeles"
});

function mediaGcJobS3Clean(nextMarker){

    console.log("mediaGcJobS3Clean");
    //Clean S3!
    var params = {Bucket: S3_BUCKET,Delimiter:"/"};
    if(nextMarker){
        params.Marker = nextMarker;
    }
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err);
            return;
        } else {
            for(var index = 0;index < data.Contents.length; index++){
                var file = data.Contents[index].Key;
                var mediaId = file.substring(0, file.indexOf("_"));
                (function(file,mediaId){
                    service.findById(mediaId,function(err,media){
                        var invalidId = err && err.name == "CastError" && err.type == "ObjectId" && err.path =="_id";
                        if(err && !invalidId){
                            console.log(err);
                        } else if(!media || invalidId){
                            //Delete s3 file!
                            console.log("File "+file+" not found");
                            var params = {Bucket: S3_BUCKET, Key:file};
                            s3.deleteObject(params, function (err, data) {
                                if (err) {
                                    console.log(err);
                                } else if (data.err) {
                                    console.log(data.err);
                                } else {
                                    console.log("File "+file+" deleted");
                                }
                            });

                        }
                });})(file,mediaId);
            }

            //console.log(data);
            if(data.IsTruncated && data.NextMarker){
                mediaGcJobS3CleanAux(data.NextMarker);
            } else{
                console.log("S3 Finished");
            }

        }
    });

}

function mediaJobCleanDb(){
    console.log("mediaJobCleanDb ");
    var stream = Media.find({uploadStatus:UPLOAD_STATUSES_UPLOADED}).stream();

    stream.on('data', function (media) {
        //stream pause
        this.pause();
        var self = this;

        if(media.created.getDaysBetween(Date.now()) > 1){
            //Media expired
            console.log("Media expired "+media._id);
            service.remove(media,function(err){
                if (err) {
                    console.error(err);
                }
                self.resume();
            })
        }else{
            self.resume();
        }

    }).on('error', function (err) {
        // handle the error
    }).on('close', function () {
        // the stream is closed
        console.log("mediaJobCleanDb end");
    });
}

mediaGcJob.start();


var service = {};

service.findById = function (id, callback) {
    Media.findOne({"_id": id}, function (err, media) {
        callback(err, media);
    });
}

service.get = function (media, formatName, callback) {
    var file = temp.createWriteStream();
    var params = {Bucket: S3_BUCKET, Key: getName(media,formatName)};

    s3.getObject(params).
        on('httpData',function (chunk) {
            file.write(chunk);
        }).
        on('httpDone',function () {
            file.on('close', function () {
                //If you don't do this in a event then the size would be incorrect
                media.tempPath = file.path;
                callback(null, media);
            });
            file.end();
        }).
        send();
};

service.remove = function (media, callback) {
    media.remove(function (err) {
        if (err) {
            callback(err);
        } else {
            // There is a bug in S3 Lib
            // https://github.com/aws/aws-sdk-js/issues/240
            try {
                service.removeAux(media, FORMAT_LARGE.name, function (err) {
                    if (err) {
                        console.log("Could not delete from s3: " + media + " err:" + err);
                    }
                    service.removeAux(media, FORMAT_THUMB.name, function (err) {
                        if (err) {
                            console.log("Could not delete from s3: " + media + " err:" + err);
                        }
                        callback();
                    });
                });
            }
            catch (e) {
                console.log("Could not delete from s3: " + media + " err:" + e);
                callback();
            }
        }
    });

};


service.removeAux = function (media, formatName, callback) {
    var params = {Bucket: S3_BUCKET, Key: getName(media,formatName)};
    s3.deleteObject(params, function (err, data) {
        if (err) {
            callback(err)
        } else {
            callback();
        }
    });
};

service.assign = function(mediaId,canView,visibility,entityRefId,entityRefName, callback){
    if(!entityRefId){
        return callback("Entity Ref Id required");
    }
    if(!entityRefName){
        return callback("Entity Ref Name required");
    }
    service.findById(mediaId,function(err,media){
        if(err){
            callback(err);
        } else if(!media){
            callback("Media not found");
        }else{
            media.canView = canView;
            media.visibility = visibility;
            media.entityRefId = entityRefId;
            media.entityRefName = entityRefName;
            media.uploadStatus = UPLOAD_STATUSES_ASSIGNED;
            media.save(function(err){
               callback(err);
            });
        }
    })
}

service.create = function (originalPath, contentType, name, ownerId, callback) {
    var media = new Media();
    media.ownerId = ownerId;
    media.contentType = contentType;
    media.name = name;

    imageMagick(originalPath).identify(function(err,data){
        if (!err){
            //console.log(data)
            if(data &&
                data.Properties &&
                data.Properties['exif:GPSLatitude'] &&
                data.Properties['exif:GPSLongitude']) {

                var latitude = toDecimal(data.Properties['exif:GPSLatitude']);

                if(data.Properties['exif:GPSLatitudeRef'] != "N"){
                    latitude = latitude * -1;
                }

                var longitude = toDecimal(data.Properties['exif:GPSLongitude']);
                if(data.Properties['exif:GPSLongitudeRef'] != "E"){
                    longitude = longitude * -1;
                }
                media.exifLocation = [longitude,latitude];
                console.log(""+latitude + " "+longitude);
            } else {
                console.log("No GPS exif data");
            }

            media.save(function (err) {
                if (err) {
                    callback(err);
                } else {
                    service.createAux(originalPath, media, FORMAT_THUMB, function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            service.createAux(originalPath, media, FORMAT_LARGE, function (err) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, media._id);
                                }
                            });
                        }
                    })
                }
            });
        }
    });


}

function toDecimal(coor){
    //coor is an array like this 40/1, 39/1, 5429/100
    var coorArray = coor.split(",");
    var hoursStr = coorArray[0];
    var minutesStr = coorArray[1];
    var secondsStr = coorArray [2];

    var number = toDecimalPart(hoursStr);
    number = number + (toDecimalPart(minutesStr) /60);
    number = number + (toDecimalPart(secondsStr) / (60*60));
    //console.log(number);
    return number;

}

function toDecimalPart(subCoor){
    //String like this 5429/100
    var number = Number(subCoor.substring(0, subCoor.indexOf("/")));
    var decimals = Number(subCoor.substring(subCoor.indexOf("/")+1,subCoor.length));
    return number / decimals;

}

/**
 * Store format image in S3
 */
service.createAux = function (originalPath, media, format, callback) {
    var tempPath = temp.path();

    imageMagick(originalPath).size(function(err, size){

        var landscape = true;
        if( size.height > size.width ){
            landscape = false;
        }
        var widthConstrain = format.width;
        var heightConstrain = format.height;

        if(!landscape){
            widthConstrain  = format.height;
            heightConstrain = format.width;
        }


        imageMagick(originalPath)
            .resize(widthConstrain, heightConstrain+ ">")
            .autoOrient()
            .quality(QUALITY)
            .write(tempPath, function (err) {
                if (err) {
                    callback(err);
                } else {
                    var bodyStream = fs.createReadStream(tempPath);

                    var params = {
                        Bucket: S3_BUCKET,
                        Key: getName(media,format.name),
                        Body: bodyStream,
                        ContentType: media.contentType
                    };

                    s3.putObject(params, function (err, data) {
                        if (err) {
                            //TODO remove image from db
                            callback(err);
                        } else {
                            //there's an e-tag but I am not going to do anything with it.
                            callback(null);
                        }
                    });
                }
            });
        // note : value may be undefined
    });

}

function getName(media,formatName){
    return media._id + "_" + formatName;
}

module.exports = {
    Media: Media,
    Service: service,
    VISIBILITY_PUBLIC: VISIBILITY_PUBLIC,
    VISIBILITY_PRIVATE: VISIBILITY_PRIVATE,
    UPLOAD_STATUSES_ASSIGNED:UPLOAD_STATUSES_ASSIGNED
};