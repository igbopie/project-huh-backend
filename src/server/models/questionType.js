var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema;


var questionTypeSchema = new Schema({
  word: {type: String, required: true, unique: true},
  color: {type: String, required: true},
  created: {type: Date, required: true, default: Date.now},
  updated: {type: Date, required: true, default: Date.now}
});

var QuestionType = mongoose.model('QuestionType', questionTypeSchema);

//Service?
var QuestionTypeService = {};

QuestionTypeService.find = function(word, callback) {
  QuestionType.findOne({word: word}, function(err, type){
    callback(err, type);
  });
};

QuestionTypeService.list = function (callback) {
  QuestionType.find({},callback);
};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: QuestionTypeService
};



// CheckTypes

var initialList = [
  {
    word:"WHERE",
    color:"#FFCA00"
  },
  {
    word:"WHAT",
    color:"#5CC6B0"
  },
  {
    word:"WHEN",
    color:"#FC4B4E"
  },
  {
    word:"WHY",
    color:"#53ADE6"
  },
  {
    word:"WHO",
    color:"#FF9200"
  },
  {
    word:"HOW",
    color:"#E35FA9"
  },
  {
    word:"WTF",
    color:"#D1E89E"
  }
];
(function () {
  u.each(initialList, function (element) {
    QuestionTypeService.find(element.word, function(err, type){
      if (err) return console.error("Word check error: "+err);

      if (!type) {
        var qType = new QuestionType();
        qType.word = element.word;
        qType.color = element.color;
        qType.save(function(err) {
          if (err) return console.error("Word saved error: "+err);

          console.log("Word created "+ element);
        });
      } else {
        console.log("Word already there");
      }
    });

  });
})();
