var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils'),
  LOCATION_LONGITUDE = 0,
  LOCATION_LATITUDE = 1
  ;


var questionSchema = new Schema({
  typeId: {type: Schema.Types.ObjectId, required: true, ref: "QuestionType"},
  //type: {type: String, required: true},
  text: {type: String, required: false},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now},
  location: {type: [Number], required: false, index: '2dsphere'}
});

questionSchema.index({userId: 1});

var Question = mongoose.model('Question', questionSchema);

//Service?
var service = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: service
};

var QuestionTypeService = require('../models/questionType').Service;

var processQuestion = function (dbQuestion) {
  var question = {};
  question._id = dbQuestion._id;
  question.text = dbQuestion.text;
  question.type = dbQuestion.typeId;
  question.created = dbQuestion.created;
  question.updated = dbQuestion.updated;

  return question;
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

  console.log(QuestionTypeService);

  //Validation
  QuestionTypeService.find(question.type, function (err, qType) {
    if(err) return callback(err);
    if(!qType) return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND, "Question Type not found"));
    question.typeId = qType._id;
    question.save(function(err) {
      callback(err, question);
    });
  });
};

service.list = function (callback) {
  Question.find({})
    .populate("typeId")
    .exec(function (err, questions) {
      if(err) return callback(err);

      questions = questions.map(processQuestion);

      callback(undefined,questions);
  });
};



