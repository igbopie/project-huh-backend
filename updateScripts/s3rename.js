/*
*
* AWS (Required)
* --------
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_SESSION_TOKEN (optional?)
* AWS_S3_BUCKET
*/
var mongoose = require('mongoose')
    , AWS = require('aws-sdk')
    , s3 = new AWS.S3()
    , S3_BUCKET = process.env.AWS_S3_BUCKET;
var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@troup.mongohq.com:10033/app22601356",function(err) {
    if (err) {
        console.log(err);
        callback(err);
        return;
    }

    var cursor = db.collection('media').find({});
    var first = true;
    cursor.each( function(err,media) {
        if (media && first) {
            //first = false;
            console.log("Bucket "+S3_BUCKET)
            //Bucket: S3_BUCKET,
            //Key:
            console.log("processing "+media._id);
            copy(media,"thumb",function(err1,data){
                copy(media,"large",function(err2,data){
                    if(err1) console.log("processing "+media._id+" error1: "+err1);
                    if(err2) console.log("processing "+media._id+" error2: "+err2);
                    if(!err1 && !err2) console.log("processing "+media._id+" no errors");
                    console.log("finished "+media._id);
                });
            });
        }
    });
});

function copy(media,format,callback){

    var params = {
        Bucket: S3_BUCKET, // required
        Key: getNewName(media,format),
        CopySource: S3_BUCKET +"/"+ getOldName(media,format)
    };
    s3.copyObject(params, function(err, data) {
        if (err) callback(err);
        else callback(null,data);
    });
}

function getOldName(media,format){
    var name = "" + media._id + "_" + format + "_" + media.name;
    console.log("Name: "+name);
    return name;
}

function getNewName(media,format){
    var name = media._id + "_" + format;
    console.log("Name: "+name);
    return name;
}