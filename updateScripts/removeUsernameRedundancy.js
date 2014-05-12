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
    var cursor = db.collection('items').find({});
    cursor.each( function(err,item) {
            if(item) {
                delete item.username;
                item.user = item.userId;
                delete item.userId;

                console.log("item: " + item._id);
                db.collection("items").save(item, function (err) {
                    if (err) {
                        console.log("failed to write item:" + err);
                    }
                });

            }
        }
    );
    var cursor = db.collection('seems').find({});
    cursor.each( function(err,seem) {
            if(seem) {
                delete seem.username;
                seem.user = seem.userId;
                delete seem.userId;

                console.log("seem: " + seem._id);
                db.collection("seems").save(seem, function (err) {
                    if (err) {
                        console.log("failed to write item:" + err);
                    }
                });

            }
        }
    );

    var cursor = db.collection('follows').find({});
    cursor.each( function(err,follow) {
            if(follow) {
                delete follow.followedUsername;
                follow.followed = follow.followedId;
                delete follow.followedId;
                delete follow.followerUsername;
                follow.follower = follow.followerId;
                delete follow.followerId;

                console.log("follows: " + follow._id);
                db.collection("follows").save(follow, function (err) {
                    if (err) {
                        console.log("failed to write item:" + err);
                    }
                });

            }
        }
    );

    var cursor = db.collection('feeds').find({});
    cursor.each( function(err,feed) {
            if(feed) {
                delete feed.username;
                feed.user = feed.userId;
                delete feed.userId;

                delete feed.replyToUsername;
                feed.replyToUser = feed.replyToUserId;
                delete feed.replyToUserId;

                console.log("feeds: " + feed._id);
                db.collection("feeds").save(feed, function (err) {
                    if (err) {
                        console.log("failed to write item:" + err);
                    }
                });

            }
        }
    );

});


