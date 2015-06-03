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


var NAMES = ["arrow",
  "atom",
  "aura",
  "axe",
  "biz",
  "bo",
  "bolt",
  "box",
  "bran",
  "chirp",
  "clint",
  "coco",
  "crow",
  "cruz",
  "dalek",
  "dawn",
  "dope",
  "dot",
  "egg",
  "elvis",
  "em",
  "evo",
  "fez",
  "fizz",
  "fly",
  "fox",
  "fuze",
  "gag",
  "gil",
  "gnu",
  "gonzo",
  "hal",
  "hash",
  "hawk",
  "horn",
  "hype",
  "iggy",
  "imp",
  "ink",
  "iron",
  "izzy",
  "jam",
  "jay",
  "jazz",
  "jet",
  "k9",
  "kermit",
  "kiss",
  "kit",
  "leaf",
  "led",
  "lips",
  "lucky",
  "milo",
  "moon",
  "mushroom",
  "mute",
  "nemo",
  "nix",
  "nod",
  "noon",
  "ocean",
  "odin",
  "om",
  "ood",
  "oz",
  "pac",
  "pip",
  "pluto",
  "prince",
  "quad",
  "quasi",
  "quid",
  "quiz",
  "rag",
  "red",
  "rock",
  "rod",
  "rollo",
  "rune",
  "scarf",
  "sham",
  "sid",
  "sky",
  "sonic",
  "stitch",
  "tik",
  "tin",
  "tok",
  "toof",
  "ugg",
  "uma",
  "uno",
  "up",
  "val",
  "van",
  "viz",
  "vox",
  "west",
  "wham",
  "wolf",
  "wood",
  "yak",
  "york",
  "yoyo",
  "yup",
  "zed",
  "zero",
  "zoot",
  "zulu"];