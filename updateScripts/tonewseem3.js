//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@troup.mongohq.com:10033/app22601356",function(err) {
    if (err) {
        console.log(err);
        callback(err);
        return;
    }


    var cursor = db.collection('seems').find({});
    cursor.each( function(err,seem) {
            if(seem) {
                console.log("seem: " + seem._id);

                var options = {
                    "sort": ["created","desc"]
                }

                db.collection("items").findOne({seemId:seem._id},options,function(err,item){
                    delete seem.expire;
                    seem.publishPermissions = "EVERYONE";
                    seem.coverPhotoMediaId = item.mediaId;

                    db.collection("seems").save(seem, function (err) {
                        if (err) {
                            console.log("failed to write item:" + err);
                        }
                    });
                })

            }
        }
    );


});


