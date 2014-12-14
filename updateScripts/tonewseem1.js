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


  var cursor = db.collection('seems').find({});
  cursor.each(function (err, seem) {
      if (seem) {
        console.log("seem: " + seem._id);

        if (seem.latestItems) {
          for (var i = 0; i < seem.latestItems.length; i++) {

            delete seem.latestItems[i].replyTo;
            delete seem.latestItems[i].depth;
          }


        }
        delete seem.itemId;
        delete seem.itemCaption;
        delete seem.hotScore;
        delete seem.viralScore;
        delete seem.itemMediaId;
        delete seem.username;

        seem.expire = seem.updated;

        db.collection("seems").save(seem, function (err) {
          if (err) {
            console.log("failed to write item:" + err);
          }
        });
      }
    }
  );


});


