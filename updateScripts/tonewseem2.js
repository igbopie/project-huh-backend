//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@troup.mongohq.com:10033/app22601356", function (err) {
  if (err) {
    console.log(err);
    callback(err);
    return;
  }


  var cursor = db.collection('items').find({});
  cursor.each(function (err, item) {
      if (item) {
        console.log("Item: " + item._id);


        delete item.depth;
        delete item.hotScore;
        delete item.replyCount;
        delete item.replyTo;
        delete item.viralScore;

        db.collection("items").save(item, function (err) {
          if (err) {
            console.log("failed to write item:" + err);
          }
        });
      }
    }
  );


});


