//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var globalCount = 0;

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@lighthouse.1.mongolayer.com:10224,lighthouse.0.mongolayer.com:10224/mark",function(err) {
    if (err) {
        console.log(err);
        callback(err);
        return;
    }

    globalCount = 0;
    var cursor = db.collection('items').find({});
    cursor.each( function(err,item) {
            if(item) {
                console.log("item: " + item._id);
                if (item.mapIconId) {
                    console.log(item.mapIconId);
                    var realMapIconId;
                    if (item.mapIconId == 1000) {
                        realMapIconId = "5414ea340dc98e0200452a7f";
                    } else if (item.mapIconId == 1001) {
                        realMapIconId = "5414ea170dc98e020045291f";
                    } else if (item.mapIconId == 1002) {
                        realMapIconId = "5414ea5a0dc98e0200452c25";
                    } else if (item.mapIconId == 1003) {
                        realMapIconId = "5414ea740dc98e0200452d85";
                    } else if (item.mapIconId == 1004) {
                        realMapIconId = "5414ea980dc98e0200452f2b";
                    } else if (item.mapIconId == 1005) {
                        realMapIconId = "5414eab00dc98e0200452fb7";
                    } else if (item.mapIconId == 1006) {
                        realMapIconId = "5414eb590dc98e02004537a9";
                    } else if (item.mapIconId == 1007) {
                        realMapIconId = "5414eb6f0dc98e02004537ab";
                    } else if (item.mapIconId == 1008) {
                        realMapIconId = "5414eb850dc98e020045390b";
                    } else if (item.mapIconId == 1009) {
                        realMapIconId = "5414eba20dc98e0200453a25";
                    } else if (item.mapIconId == 1010) {
                        realMapIconId = "5414ebbd0dc98e0200453b85";
                    } else {
                        realMapIconId = "5414ea340dc98e0200452a7f";
                    }

                    db.collection('mapicons').findOne({_id: new mongoose.Types.ObjectId(realMapIconId)}, function (err, mapIcon) {
                        if(err) return console.log(err);
                        if(!mapIcon) return console.log("Not found");

                        item.mapIconId = mapIcon._id;
                        item.mapIconMediaId = mapIcon.mediaId;
                        db.collection("items").save(item, function (err) {
                            if (err) {
                                console.log("failed to write item:" + err);
                            }else{
                                console.log("Saved!")
                            }
                        });

                    });
                }
            }

        }
    );


});


