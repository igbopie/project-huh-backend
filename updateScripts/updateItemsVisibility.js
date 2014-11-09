//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var globalCount = 0;

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@kahana.mongohq.com:10090/app29908048",function(err) {
    if (err) {
        console.log(err);
        callback(err);
        return;
    }


    var cursor = db.collection('items').find();
    cursor.each( function(err,item) {
        if(err){
            console.log(err);
        }else {
            if(item){
                db.collection('marks').findOne({_id:item.markId},function(err,mark) {
                    if(err){
                        console.log(err);
                    }else {
                        console.log("item " + item._id + " mark:" + mark._id);
                        item.visibility = mark.visibility;
                        db.collection("items").save(item, function (err) {
                            if (err) {
                                console.log("failed to write item:" + err);
                            }else{
                                console.log("Item updated "+item._id);
                            }
                        });
                    }
                });
            }

        }
    });


});


