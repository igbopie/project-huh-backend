//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var globalCount = 0;

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@troup.mongohq.com:10033/app22601356",function(err) {
    if (err) {
        console.log(err);
        callback(err);
        return;
    }

    globalCount = 0;
    var cursor = db.collection('thumbs').find({});
    cursor.each( function(err,thumb) {
            if(thumb) {
                db.collection('actions').findOne({itemId:thumb.itemId,user:thumb.userId},function(err,action){
                    if(!action) {
                        action = {};
                        action.itemId = thumb.itemId;
                        action.user = thumb.userId;
                    }
                    action.thumbScore = thumb.score;
                    action.thumbedDate = thumb.created;
                    console.log("thumbs: " + thumb._id);
                    //console.log(action);
                    db.collection("actions").save(action, function (err) {
                        if (err) {
                            console.log("failed to write item:" + err);
                        }
                    });
                });


            }
        }
    );


});


