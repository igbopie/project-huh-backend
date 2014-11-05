//BEFORE
//  mongoexport -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o seembk.json
// mongodump -h troup.mongohq.com:10033 -d app22601356 -u nacho -p 123456 -o bk
var mongoose = require('mongoose');

var globalCount = 0;

var db = mongoose.createConnection();
//Resest DB
db.open("mongodb://nacho:123456@lighthouse.1.mongolayer.com:10224,lighthouse.0.mongolayer.com:10224/mark",function(err) {
    if (err) {
        console.log(err);
        callback(err);
        return;
    }

    globalCount = 0;
    var cursor = db.collection('items').find({});
    cursor.each( function(err,item) {
            if(item) {
                console.log("item: " + item._id);
                if (item.templateId) {
                    console.log(item.templateId);

                    db.collection('templates').findOne({_id: item.templateId}, function (err, template) {
                        if(err) return console.log(err);
                        if(!template){
                            console.log("template not found");
                            //fix!

                            item.mediaId = item.templateMediaId;
                            item.teaserMediaId = item.teaserTemplateMediaId;

                            delete item.templateId;
                            delete item.templateMediaId;
                            delete item.teaserTemplateMediaId;

                            db.collection("items").save(item, function (err) {
                                 if (err) {
                                    console.log("failed to write item:" + err);
                                 }else{
                                    console.log("Saved!")
                                 }
                            })
                        }





                    });
                }
            }

        }
    );


});


