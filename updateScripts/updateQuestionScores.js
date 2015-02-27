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
  var DATE_CONSTANT = new Date(2015,01,01,00,00,00,00).getTime();
  var cursor = db.collection('questions').find({});
  cursor.each(function (err, question) {
      if (question) {

        question.createdScore = Math.round((question.created.getTime() - DATE_CONSTANT) / 1000);
        question.activity = question.nComments + question.nVotes;
        question.popularScore = question.voteScore * question.createdScore;
        question.trendingScore = question.activity * question.createdScore;
        db.collection("questions").save(question, function (err) {
          if (err) {
            console.log("failed to write item:" + err);
          } else {
            console.log("question updated " + question.text +" "+JSON.stringify(question));
          }
        });
      }
    }
  );


});


