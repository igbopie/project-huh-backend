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
    var cursor = db.collection('m1seems').find({});
    cursor.each( function(err,seem) {
            if(seem) {
                console.log("Seem: " + seem.title);
                var nItems = 0;
                //Count items
                var parentItemId = seem.itemId;
                var stats={seemCount:0}
                countAux(db,seem.itemId,seem,0,stats);

            }
        }
    );

});

function countAux(db,parentItemId,seem,count,stats){
    db.collection('m1items').findOne({_id:parentItemId},function(err,item){
        item.depth = count;
        item.seemId = seem._id;
        db.collection('m1items').save(item,function(err){
            if(err){
                console.log("failed to write item:"+err);
            }
        });

        count++;
        stats.seemCount++;
        globalCount++;
        console.log("Seem "+seem.title+" Item: " + item._id+" count:"+count+" globalcount:"+globalCount+" seemCount:"+stats.seemCount);
        var cursor = db.collection('m1items').find({replyTo:parentItemId});
        cursor.each( function(err,item) {
            if (item) {
                countAux(db,item._id,seem,count,stats);
            } else {
                console.log("Seem "+seem.title+" ParentItem:"+parentItemId+" Finished subtree? :"+count);
                seem.itemCount = stats.seemCount;
                db.collection("m1seems").save(seem,function(err){
                    if(err){
                        console.log("failed to write seem:"+err);
                    }
                });
            }
        });
    });
}

