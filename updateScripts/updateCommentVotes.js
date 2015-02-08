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
        db.collection('commentvotes').find({commentId: comment._id}).count(function (err, nVotes) {
          if (err) {
            console.log(err);
          } else {
            comment.nVotes = nVotes;
            db.collection('commentvotes').find({commentId: comment._id, score: {$eq: 1}}).count(function (err, nUpVotes) {
              if (err) {
                console.log(err);
              } else {
                comment.nUpVotes = nUpVotes;
                db.collection('commentvotes').find({commentId: comment._id, score: {$eq: -1}}).count(function (err, nDownVotes) {
                  if (err) {
                    console.log(err);
                  } else {
                    comment.nDownVotes = nDownVotes;
                    db.collection("comments").save(comment, function (err) {
                      if (err) {
                        console.log("failed to write item:" + err);
                      } else {
                        console.log("Comment updated: "+JSON.stringify(comment));
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  );


});


