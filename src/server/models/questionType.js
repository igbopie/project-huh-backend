var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema;


var questionTypeSchema = new Schema({
  word: {type: String, required: true, unique: true},
  color: {type: String, required: true},
  weight: {type: Number, required: true},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now}
});

questionTypeSchema.index({weight: 1});

var QuestionType = mongoose.model('QuestionType', questionTypeSchema);

//Service?
var QuestionTypeService = {};

QuestionTypeService.find = function(word, callback) {
  QuestionType.findOne({word: word}, function(err, type){
    callback(err, type);
  });
};

QuestionTypeService.list = function (callback) {
  QuestionType.find({}).sort({ weight: 1 }).exec(callback);
};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: QuestionTypeService
};



// CheckTypes

var initialList = [
  {
    word:"WHAT",
    color:"#85E39D",
    weight: 0
  },
  {
    word:"WHERE",
    color:"#FFCF1A",
    weight: 10
  },
  {
    word:"WHEN",
    color:"#E03A5D",
    weight: 20
  },
  {
    word:"WHY",
    color:"#52ACBE",
    weight: 30
  },
  {
    word:"WHO",
    color:"#FF9C1B",
    weight: 40
  },
  {
    word:"HOW",
    color:"#F08596",
    weight: 50
  },
  {
    word:"WHICH",
    color:"#34495E",
    weight: 55
  },
  {
    word:"WTF",
    color:"#6D72CE",
    weight: 60
  }
];
(function () {
  u.each(initialList, function (element) {
    QuestionTypeService.find(element.word, function(err, qType){
      if (err) return console.error("Word check error: "+err);

      if (!qType) {
        var qType = new QuestionType();
        qType.created = Date.now();
      }
      qType.word = element.word;
      qType.color = element.color;
      qType.weight = element.weight;
      qType.updated = Date.now();
      qType.save(function(err) {
        if (err) return console.error("Word saved error: "+err);

        console.log("Word updated "+ element);
      });

    });

  });
})();
