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


    var cursor = db.collection('users').find({});
    cursor.each( function(err,user) {
            if(user) {
                db.collection('items').find({user:user._id}).count(function(err,countPublished){
                    if(err){
                        console.log(err);
                    }else {
                        db.collection('actions').find({user:user._id,favourited:true}).count(function(err,countFavs) {
                            if(err){
                                console.log(err);
                            }else {
                                console.log("User " + user.username + " countP:" + countPublished + " countFavs:" + countFavs);
                                user.favourites = countFavs;
                                user.published = countPublished;
                                db.collection("users").save(user, function (err) {
                                    if (err) {
                                        console.log("failed to write item:" + err);
                                    }else{
                                        console.log("User updated "+user.username);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    );


});


