var mongoose = require('mongoose'),
  u = require('underscore'),
  UrlShortener = require('../utils/urlshortener'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils'),
  LOCATION_LONGITUDE = 0,
  LOCATION_LATITUDE = 1,
  DATE_CONSTANT = new Date(2015,01,01,00,00,00,00).getTime(),
  LOCATION_RADIUS = 10 * 1000; //meters
//Date(year, month, day, hours, minutes, seconds, milliseconds);
  ;


var questionSchema = new Schema({
  typeId: {type: Schema.Types.ObjectId, required: true, ref: "QuestionType"},
  //type: {type: String, required: true},
  text: {type: String, required: false},
  url: {type: String, required: false},
  username: {type: String, required: false},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now},
  location: {type: [Number], required: false, index: '2dsphere'},
  voteScore: {type: Number, required: true, default: 0},
  nVotes: {type: Number, required: true, default: 0},
  nUpVotes: {type: Number, required: true, default: 0},
  nDownVotes: {type: Number, required: true, default: 0},
  nComments: {type: Number, required: true, default: 0},
  activity: {type: Number, required: true, default: 0}, // nComments + nVotes
  createdScore: {type: Number, required: true, default: 0},
  trendingScore: {type: Number, required: true, default: 0}, // activity * (timeCreated - constant)
  popularScore: {type: Number, required: true, default: 0} // voteScore * (timeCreated - constant)
});

questionSchema.index({userId: 1});
questionSchema.index({created: -1});
questionSchema.index({voteScore: -1});
questionSchema.index({nComments: -1});
questionSchema.index({trendingScore: -1});
questionSchema.index({popularScore: -1});


var Question = mongoose.model('Question', questionSchema);

//Service?
var QuestionService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: QuestionService
};

var QuestionTypeService = require('../models/questionType').Service;
var QuestionVoteService = require('../models/questionVote').Service;
var QuestionNameService = require('../models/questionName').Service;
var NotificationService = require('../models/notification').Service;

var processQuestion = function (dbQuestion, userId, callback) {


  var process = function() {
    var subProcess = function () {
      var question = {};
      question._id = dbQuestion._id;
      question.text = dbQuestion.text;
      question.type = dbQuestion.typeId;
      question.created = dbQuestion.created;
      question.updated = dbQuestion.updated;
      question.voteScore = dbQuestion.voteScore;
      question.nComments = dbQuestion.nComments;
      question.nVotes = dbQuestion.nVotes;
      question.nUpVotes = dbQuestion.nUpVotes;
      question.nDownVotes = dbQuestion.nDownVotes;
      question.username = dbQuestion.username;
      question.url = dbQuestion.url;

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

    if (dbQuestion.typeId instanceof mongoose.Types.ObjectId){
      var populate = [
        { path: 'typeId' }
      ];
      Question.populate(dbQuestion, populate, function (err) {
        if(err){
          console.error("Could not populate typeId");
        }

        subProcess();
      });
    } else {
      subProcess();
    }

  };

  var processUserName = function(){
    if (!dbQuestion.username) {
      QuestionNameService.findOrCreate(dbQuestion._id, dbQuestion.userId, function (err, username) {
        if (err) return callback(err);

        dbQuestion.username = username;

        dbQuestion.save(function (err) {
          if (err) return callback(err);

          processShortLink();
        });
      });
    } else {
      processShortLink();
    }
  };

  var processShortLink = function(){
    if (!dbQuestion.url) {
      UrlShortener.shortenQuestion(dbQuestion._id, function (err, url) {
        if (err) console.error(err);

        dbQuestion.url = url;

        dbQuestion.save(function (err) {
          if (err) return callback(err);

          process();
        });
      });

    } else {
      process();
    }
  };

  processUserName();
};


QuestionService.create = function (type, text, latitude, longitude, userId, callback) {
  var question = new Question();
  question.type = type;
  question.text = text;
  question.userId = userId;
  question.created = Date.now();
  question.createdScore = Math.round((question.created.getTime() - DATE_CONSTANT) / 1000);

  if (latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null) {
    var locationArray = [];
    locationArray[LOCATION_LONGITUDE] = longitude;
    locationArray[LOCATION_LATITUDE] = latitude;
    question.location = locationArray;
  }

  //Validation
  QuestionTypeService.find(question.type, function (err, qType) {
    if(err) return callback(err);
    if(!qType) return callback(Utils.error(Utils.ERROR_CODE_NOTFOUND, "Question Type not found"));
    question.typeId = qType._id;
    question.save(function(err) {
      if(err) return callback(err);

      question.typeId = qType;
      QuestionNameService.findOrCreate(question._id, question.userId, function(err, username) {
        if (err) return callback(err);

        question.username = username;
        UrlShortener.shortenQuestion(question._id, function(err, url){
          if (err) console.error(err);

          question.url = url;
          question.save(function(err){
            if (err) return callback(err);

            processQuestion(question, userId, callback);

            NotificationService.onQuestionCreated(question._id, qType);
          });
        });

      });
    });
  });
};

var execQuery = function (query, sort, userId, page, numItems, callback) {
  Question.find(query,
    null,
    {
      limit: numItems,
      skip: numItems * page,
      sort: sort
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

QuestionService.recent = function ( userId, page, numItems, callback) {
  execQuery({},{
    'created': -1
  }, userId, page, numItems, callback);
};

QuestionService.trending = function ( userId, page, numItems, callback) {
  execQuery({},{
    'trendingScore': -1
  }, userId, page, numItems, callback);
};

QuestionService.popular = function ( userId, page, numItems, callback) {
  execQuery({},{
    'popularScore': -1
  }, userId, page, numItems, callback);
};

QuestionService.mine = function ( userId, page, numItems, callback) {
  execQuery(
    {userId: userId},
    {
      'created': -1
    },
    userId, page, numItems, callback);
};

QuestionService.commented = function ( userId, page, numItems, callback) {
  execQuery(
    {userId: userId},
    {
      'created': -1
    },
    userId, page, numItems, callback);
};

QuestionService.near = function ( userId, latitude, longitude, page, numItems, callback) {
  var coordinates = [];
  coordinates[LOCATION_LATITUDE] = Number(latitude);
  coordinates[LOCATION_LONGITUDE] = Number(longitude);

  Question.aggregate(
    [
      {
        $geoNear: {
          near: {type: "Point", coordinates: coordinates},
          distanceField: "dist",
          maxDistance: LOCATION_RADIUS,
          query: {},
          limit: 10000,
          spherical: true
        }
      },
      {$sort: {created: -1}},
      {$skip: numItems * page},
      {$limit: numItems},
    ]
  )
  .exec(function (err, questions) {
    if (err) callback(err);

    Utils.map(
      questions,
      function(dbQuestion, mapCallback) {
        processQuestion(dbQuestion, userId, mapCallback);
      },
      callback
    );
  });
};

QuestionService.processQuestionIds = function (questionIds, userId, callback) {
  execQuery(
    {_id: { $in:questionIds } },
    {
      'created': -1
    },
    userId, 0, questionIds.length, callback);
};

QuestionService.updateVoteScore = function (voteIncrement, score, newVote, questionId, callback) {
  console.log(voteIncrement);
  var conditions = { _id: questionId }
    , update = { $inc: { voteScore: voteIncrement }}
    , options = { multi: false, new: true };

  if (newVote) {
    update.$inc.nVotes = 1;
    update.$inc.activity = 1;

    if (score > 0) {
      update.$inc.nUpVotes = 1;
    } else {
      update.$inc.nDownVotes = 1;
    }
  } else {
    if (score > 0) {
      update.$inc.nUpVotes = 1;
      update.$inc.nDownVotes = -1;
    } else if (score < 0) {
      update.$inc.nUpVotes = -1;
      update.$inc.nDownVotes = 1;
    } else {
      //clear score
      update.$inc.nVotes = -1;

      if (voteIncrement > 0) {
        update.$inc.nDownVotes = -1;
      } else {
        update.$inc.nUpVotes = -1;
      }
    }
  }

  Question.findOneAndUpdate(conditions, update, options,
    function (err, question) {
      question.popularScore = question.voteScore * question.createdScore;
      question.trendingScore = question.activity * question.createdScore;
      question.save(callback(err));
    });
};

QuestionService.incCommentCount = function (questionId, callback) {
  var conditions = { _id: questionId }
    , update = { $inc: { nComments: 1 }}
    , options = { multi: false, new: true };

  update.$inc.activity = 1;

  Question.findOneAndUpdate(conditions, update, options,
    function (err, question) {
      question.trendingScore = question.activity * question.createdScore;
      question.save(callback(err));
    });
};

QuestionService.findById = function (questionId, callback) {
  Question.findOne({ _id: questionId }).populate('typeId').exec(callback);
};

QuestionService.view = function (questionId, userId, callback) {
  Question.findOne({ _id: questionId }, function(err, doc) {
    if (err) return callback(err);

    processQuestion(doc, userId, callback);
  });
};






