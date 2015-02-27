var mongoose = require('mongoose'),
  u = require('underscore'),
  Schema = mongoose.Schema,
  Utils = require('../utils/utils'),
  LOCATION_LONGITUDE = 0,
  LOCATION_LATITUDE = 1,
  DATE_CONSTANT = new Date(2015,01,01,00,00,00,00).getTime();
//Date(year, month, day, hours, minutes, seconds, milliseconds);
  ;


var questionNameSchema = new Schema({
  questionId: {type: Schema.Types.ObjectId, required: true, ref: "QuestionType"},
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  name: {type: String, required: true}
});

questionNameSchema.index({questionId: 1, userId: 1}, {unique: true});


var QuestionName = mongoose.model('QuestionName', questionNameSchema);

//Service?
var QuestionNameService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
  Service: QuestionNameService
};

var NAMES = [
  "Aura",
  "Biz",
  "Clint",
  "Dope",
  "Em",
  "Fizz",
  "Gag",
  "Hawk",
  "Imp",
  "Jet",
  "Kermit",
  "Lucky",
  "Moon",
  "Nod",
  "Oz",
  "Pip",
  "Quid",
  "Red",
  "Sage",
  "Tok",
  "Ugg",
  "Vox",
  "Wolf",
  "Yak",
  "Zoot",
  "Art",
  "Bo",
  "Coco",
  "Dot",
  "Elf",
  "Fox",
  "Gonzo",
  "Hal",
  "Iron",
  "Jazz",
  "Kiss",
  "Led",
  "Mega",
  "Nacho",
  "Ocean",
  "Pluto",
  "Quiz",
  "Rod",
  "Scar",
  "Tik",
  "Uno",
  "Van",
  "West",
  "Yoyo",
  "Zero",
  "Axe",
  "Box",
  "Crow",
  "Dawn",
  "Evo",
  "Fly",
  "Gnu",
  "Hype",
  "Ink",
  "Jam",
  "Kit",
  "Lick",
  "Moby",
  "Noon",
  "Om",
  "Pez",
  "Quasi",
  "Rock",
  "Storm",
  "Tee",
  "Uma",
  "Val",
  "Wood",
  "York",
  "Zed",
  "Ace",
  "Beta",
  "Cruz",
  "Dash",
  "Echo",
  "Foo",
  "Gil",
  "Hulk",
  "Iggy",
  "Jay",
  "Knox",
  "Lips",
  "Milo",
  "Nemo",
  "Op",
  "Prince",
  "Quad",
  "Rune",
  "Sky",
  "Tin",
  "Up",
  "Viz",
  "Wham",
  "Yup",
  "Zulu"
];

QuestionNameService.findOrCreate = function(userId, questionId, callback) {
  QuestionName.findOne({questionId: questionId, userId: userId}, function(err, questionName){
    if(err) return callback(err);

    if(!questionName){
      var questionName = new QuestionName();
      questionName.userId = userId;
      questionName.questionId = questionId;
      questionName.name = NAMES[Math.floor((Math.random() * NAMES.length))];
      questionName.save(function(err){
        callback(err, questionName.name);
      });
    } else {
      callback(null, questionName.name);
    }
  });
};

