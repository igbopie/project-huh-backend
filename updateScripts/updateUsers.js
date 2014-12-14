//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var globalCount = 0;

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@troup.mongohq.com:10033/app22601356", function (err) {
  if (err) {
    console.log(err);
    callback(err);
    return;
  }

  globalCount = 0;
  var cursor = db.collection('users').find({});
  cursor.each(function (err, user) {
      if (user) {
        delete user.followings;
        user.followers = 0;
        user.following = 0;
        console.log("user: " + user.username);
        db.collection("users").save(user, function (err) {
          if (err) {
            console.log("failed to write seem:" + err);
          }
        });

      }
    }
  );

});


