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
  //var cursor = db.collection('items').find({user:{$exists:false}});
  var cursor = db.collection('items').find({user: null});
  cursor.each(function (err, item) {
      if (err) {
        console.log(err);
      } else if (item) {
        console.log("Item " + item.caption);
        item.user = new mongoose.Types.ObjectId("53737aa0975538020027d2c4");
        db.collection('items').save(item, function (err) {
          if (err) {
            console.log("failed to write item:" + err);
          } else {
            console.log("Item updated " + item.caption);
          }
        });
      } else {
        console.log("No Item");
      }
    }
  );
  var cursor = db.collection('seems').find({user: null});
  cursor.each(function (err, seem) {
      if (err) {
        console.log(err);
      } else if (seem) {
        console.log("Seem " + seem.title);
        seem.user = new mongoose.Types.ObjectId("53737aa0975538020027d2c4");
        db.collection('seems').save(seem, function (err) {
          if (err) {
            console.log("failed to write seem:" + err);
          } else {
            console.log("Seem updated " + seem.title);
          }
        });
      } else {
        console.log("No Seem");
      }
    }
  );

});


