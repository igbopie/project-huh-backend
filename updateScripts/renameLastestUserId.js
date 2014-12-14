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


  var cursor = db.collection('seems').find({});
  cursor.each(function (err, seem) {
      if (seem) {
        if (seem.latestItems) {
          for (var i = 0; i < seem.latestItems.length; i++) {
            if (seem.latestItems[i].userId) {
              seem.latestItems[i].user = seem.latestItems[i].userId;
              delete seem.latestItems[i].userId;
            }
            delete seem.latestItems[i].username;
          }

          console.log("seem: " + seem._id);
          db.collection("seems").save(seem, function (err) {
            if (err) {
              console.log("failed to write item:" + err);
            }
          });
        }


      }
    }
  );


});


