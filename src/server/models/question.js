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
  location: {type: [Number], required: false, index: '2dsphere'},
  voteScore: {type: Number, required: true, default: 0},
  nComments: {type: Number, required: true, default: 0}
});

questionSchema.index({userId: 1});
questionSchema.index({created: -1});

var Question = mongoose.model('Question', questionSchema);

//Service?
var service = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: service
};

var QuestionTypeService = require('../models/questionType').Service;
var QuestionVoteService = require('../models/questionVote').Service;

var processQuestion = function (dbQuestion, userId, callback) {
  var question = {};
  question._id = dbQuestion._id;
  question.text = dbQuestion.text;
  question.type = dbQuestion.typeId;
  question.created = dbQuestion.created;
  question.updated = dbQuestion.updated;
  question.voteScore = dbQuestion.voteScore;
  question.nComments = dbQuestion.nComments;
  if (userId) {
    QuestionVoteService.findVote(dbQuestion._id, userId, function(err, vote) {
      if(err){
        console.error("Could not fetch my score");
      }
      if(vote){
        question.myVote = vote.score;
      }
      callback(undefined, question);
    });
  } else {
    callback(undefined, question);
  }
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
      if(err) return callback(err);

      question.typeId = qType;
      processQuestion(question, userId, callback);
    });
  });
};

service.list = function (userId, page, numItems, callback) {
  Question.find({},
    null,
    {
      limit: numItems,
      skip: numItems * page,
      sort: {
        'created': -1
      }
    })
    .populate("typeId")
    .exec(function (err, questions) {
      if(err) return callback(err);

      Utils.map(
        questions,
        function(dbQuestion, mapCallback) {
          processQuestion(dbQuestion, userId, mapCallback);
        },
        callback
      );

  });
};

service.updateVoteScore = function (voteIncrement, questionId, callback) {
  var conditions = { _id: questionId }
    , update = { $inc: { voteScore: voteIncrement }}
    , options = { multi: false };

  Question.update(conditions, update, options,
    function (err) {
      callback(err);
    });
};

service.incCommentCount = function (questionId, callback) {
  var conditions = { _id: questionId }
    , update = { $inc: { nComments: 1 }}
    , options = { multi: false };

  Question.update(conditions, update, options,
    function (err) {
      callback(err);
    });
};




