//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var globalCount = 0;

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@kahana.mongohq.com:10090/app29908048", function (err) {
  if (err) {
    console.log(err);
    callback(err);
    return;
  }


  var cursor = db.collection('marks').find();
  cursor.each(function (err, mark) {
    if (err) {
      console.log(err);
    } else {
      if (mark) {
        mark.status = 1;
        mark.canDelete = false;
        console.log("mark " + mark.status);
        db.collection("marks").save(mark, function (err) {
          if (err) {
            console.log("failed to write mark:" + err);
          } else {
            console.log("Mark updated " + mark._id);
          }
        });
      }

    }
  });


});


