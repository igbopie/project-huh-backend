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

  var cursor = db.collection('questions').find({});
  cursor.each(function (err, question) {
      if (question) {
        db.collection('comments').find({questionId: question._id}).count(function (err, nComments) {
          if (err) {
            console.log(err);
          } else {
            question.nComments = nComments;

            db.collection("questions").save(question, function (err) {
              if (err) {
                console.log("failed to write item:" + err);
              } else {
                console.log("question updated " + question.text +" "+nComments);
              }
            });
          }
        });
      }
    }
  );


});


