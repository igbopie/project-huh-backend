var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var reportSchema = new Schema({
    fromUserId  : {	type: Schema.Types.ObjectId, required: true}
  , itemId      : {	type: Schema.Types.ObjectId, required: false}
  , markId	    : {	type: Schema.Types.ObjectId, required: false}
  , userId	    : {	type: Schema.Types.ObjectId, required: false}
  , message     : { type: String, required: true }
  , created     : { type: Date, required: true, default: Date.now }
});


reportSchema.index({fromUserId: 1});
reportSchema.index({itemId: 1});
reportSchema.index({markId: 1});
reportSchema.index({markId: 1});
reportSchema.index({created: -1});


var Report = mongoose.model('Report', reportSchema);

//Service?
var service = {};

service.createReport = function(fromUserId,itemId,markId,userId,message,callback){

  var report = new Report();
  report.fromUserId = fromUserId;
  report.message = message;
  if (itemId) {
    report.itemId = itemId;
  }
  if (markId) {
    report.markId = markId;
  }
  if (userId) {
    report.userId = userId;
  }
  report.save(function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null,report);
        }
  });
};

service.list = function(callback){

  Report.find({}).sort({created:-1}).exec(
    function(err,docs) {
      if(err) {
        callback(err);
      } else {
        callback(null,docs);
      }
  });

};


module.exports = {
  Report: Report,
  Service:service
};