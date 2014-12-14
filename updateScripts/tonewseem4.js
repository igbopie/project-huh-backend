//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var db = mongoose.createConnection();
var dbLocal = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@troup.mongohq.com:10033/app22601356", function (err) {
  if (err) {
    console.log(err);
    callback(err);
    return;
  }
  dbLocal.open("mongodb://localhost:27017/app22601356", function (err) {
    if (err) {
      console.log(err);
      callback(err);
      return;
    }
    var cursor = db.collection('items').find({});
    cursor.each(function (err, item) {
        if (item) {
          console.log("item: " + item._id);

          dbLocal.collection("items").findOne({_id: item._id}, function (err, itemLocal) {
            if (itemLocal) {
              console.log("itemLocal: " + itemLocal._id);
              item.replyTo = itemLocal.replyTo;

              db.collection("items").save(item, function (err) {
                if (err) {
                  console.log("failed to write item:" + err);
                }
              });
            }
          })

        }
      }
    );
  });


});


