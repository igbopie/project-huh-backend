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
  var cursor = db.collection('items').find({});
  cursor.each(function (err, item) {
      if (item) {
        item.status = 1;
        console.log("item: " + item._id);
        db.collection("items").save(item, function (err) {
          if (err) {
            console.log("failed to write item:" + err);
          }
        });

      }
    }
  );


});


