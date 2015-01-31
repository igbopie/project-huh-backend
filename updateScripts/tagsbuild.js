//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');
var Utils = require('./Utils');

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
        console.log("Seem: " + seem.title);

        seem.tags = Utils.extractTags(seem.itemCaption + " " + seem.title);
        db.collection("seems").save(seem, function (err) {
          if (err) {
            console.log("Error saving seem: " + seem.title)
          } else {
            console.log("Saved seem: " + seem.title)
          }
        })

      }
    }
  );

  cursor = db.collection('items').find({});
  cursor.each(function (err, item) {
      if (item) {
        console.log("Item: " + item.caption);

        item.tags = Utils.extractTags(item.caption);
        db.collection("items").save(item, function (err) {
          if (err) {
            console.log("Error saving item: " + item.caption)
          } else {
            console.log("Saved item: " + item.caption)
          }
        })

      }
    }
  );
});
