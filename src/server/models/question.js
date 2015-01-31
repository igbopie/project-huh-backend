var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , LOCATION_LONGITUDE = 0
  , LOCATION_LATITUDE = 1
  ;


var questionSchema = new Schema({
  type: {type: String, required: true},
  text: {type: String, required: false},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now},
  location: {type: [Number], required: true, index: '2dsphere'}
});

questionSchema.index({userId: 1});

var Question = mongoose.model('Question', questionSchema);

//Service?
var service = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: service
};


service.create = function (type, text, latitude, longitude, userId, callback) {
  var question = new Question();
  question.type = type;
  question.text = text;
  question.userId = userId;

  if (latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null) {
    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = longitude;
    locationArray[LOCATION_LATITUDE] = latitude;
    question.location = locationArray;
  }

  question.save(function(err) {
    callback(err, question);
  });
};

service.list = function (callback) {
  Question.find({},callback);
};

