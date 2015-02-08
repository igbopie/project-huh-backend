//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:nacho@ds053808.mongolab.com:53808/heroku_app33614482", function (err) {
  if (err) {
    console.log(err);
    callback(err);
    return;
  }

  var cursor = db.collection('comments').find({});
  cursor.each(function (err, comment) {
      if (comment) {
          comment.text = comment.text.trim();
          db.collection("comments").save(comment, function (err) {
            if (err) {
              console.log("failed to write item:" + err);
            } else {
              console.log("question updated " + comment.text +" "+JSON.stringify(comment));
            }
          });
      }
  });

});


