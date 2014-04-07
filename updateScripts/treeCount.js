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
    var cursor = db.collection('seems').find({});
    cursor.each( function(err,seem) {
            if(seem) {
                console.log("Seem: " + seem.title);
                var nItems = 0;
                //Count items
                var parentItemId = seem.itemId;
                var stats={seemCount:0,seemDepth:0}
                countAux(db,seem.itemId,seem,0,stats,function(){
                    if(seem.itemCount != stats.seemCount) {
                        console.log("WARNING Seem " + seem.title + " ParentItem:" + parentItemId + " Depth:" + stats.seemDepth + " Seem count:" + seem.itemCount + " calculated:" + stats.seemCount);
                    }
                    db.collection('items').findOne({_id:seem.itemId},function(err,item) {
                        seem.itemMediaId = item.mediaId;
                        seem.itemCaption = item.caption;
                        //seem.itemCount = stats.seemCount;
                        //seem.updated = stats.lastUpdate;
                        db.collection("seems").save(seem, function (err) {
                            if (err) {
                                console.log("failed to write seem:" + err);
                            }
                        });
                    });

                });

            }
        }
    );

});

function countAux(db,parentItemId,seem,count,stats,callback){
    db.collection('items').findOne({_id:parentItemId},function(err,parentItem){
        parentItem.depth = count;
        parentItem.seemId = seem._id;

        if(!stats.lastUpdate || stats.lastUpdate < parentItem.created){
            stats.lastUpdate = parentItem.created;
        }
        count++;
        stats.seemCount++;
        globalCount++;
        //console.log("Seem "+seem.title+" Item: " + parentItem._id+" count:"+count+" globalcount:"+globalCount+" seemCount:"+stats.seemCount);
        var cursor = db.collection('items').find({replyTo:parentItemId});
        var replyCount = 0;
        var recCount = 0;
        cursor.each( function(err,item) {
            if (item) {
                countAux(db, item._id, seem, count, stats,function(){
                    recCount--;
                    if(recCount == 0){
                        //console.log("Finished subtree");
                        callback();
                    }
                });
                replyCount++;
                recCount++;
            } else {
                if(parentItem.replyCount != replyCount){
                    console.log("WARNING Item:"+parentItem._id+"(Seem:"+seem.title+") Count:"+parentItem.replyCount+" Calculated:"+replyCount);
                }
                parentItem.replyCount = replyCount;
                /*db.collection('m1items').save(parentItem,function(err){
                    if(err){
                        console.log("failed to write item:"+err);
                    }
                });*/
                if(replyCount == 0){
                    if(count > stats.seemDepth){
                        stats.seemDepth = count;
                    }
                    callback();
                }

            }
        });
    });
}

