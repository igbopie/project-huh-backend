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
    color:"#5CC6B0",
    weight: 0
  },
  {
    word:"WHERE",
    color:"#FFCA00",
    weight: 10
  },
  {
    word:"WHEN",
    color:"#FC4B4E",
    weight: 20
  },
  {
    word:"WHY",
    color:"#53ADE6",
    weight: 30
  },
  {
    word:"WHO",
    color:"#FF9200",
    weight: 40
  },
  {
    word:"HOW",
    color:"#E35FA9",
    weight: 50
  },
  {
    word:"WTF",
    color:"#D1E89E",
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
