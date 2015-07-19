'use strict';
var mongoose = require('mongoose'),
    u = require('underscore'),
    Schema = mongoose.Schema,
    NAMES;

var questionNameSchema = new Schema({
    questionId: {type: Schema.Types.ObjectId, required: true, ref: 'QuestionType'},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    name: {type: String, required: true}
});

questionNameSchema.index({questionId: 1, userId: 1}, {unique: true});


var QuestionName = mongoose.model('QuestionName', questionNameSchema);

// Service?
var QuestionNameService = {};

// The exports is here to avoid cyclic dependency problem
module.exports = {
    Service: QuestionNameService
};


QuestionNameService.findOrCreate = function (userId, questionId, callback) {
    QuestionName.findOne({questionId: questionId, userId: userId}, function (err, questionName) {
        if (err) {
            return callback(err);
        }

        if (!questionName) {
            questionName = new QuestionName();
            questionName.userId = userId;
            questionName.questionId = questionId;
            questionName.name = NAMES[Math.floor((Math.random() * NAMES.length))];
            questionName.save(function (err) {
                callback(err, questionName.name);
            });
        } else {
            callback(null, questionName.name);
        }
    });
};

NAMES = [
    'Arrow',
    'Atom',
    'Aura',
    'Axe',
    'Beta',
    'Biz',
    'Bo',
    'Bolt',
    'Box',
    'Bran',
    'Chirp',
    'Clint',
    'Coco',
    'Crow',
    'Cruz',
    'Dalek',
    'Dawn',
    'Dope',
    'Dot',
    'Egg',
    'Elvis',
    'Em',
    'Evo',
    'Fez',
    'Fizz',
    'Fly',
    'Fox',
    'Fuze',
    'Gag',
    'Gil',
    'Gnu',
    'Gonzo',
    'Hal',
    'Hash',
    'Hawk',
    'Horn',
    'Hype',
    'Iggy',
    'Imp',
    'Ink',
    'Iron',
    'Izzy',
    'Jam',
    'Jay',
    'Jazz',
    'Jet',
    'K9',
    'Kermit',
    'Kiss',
    'Kit',
    'Leaf',
    'Led',
    'Lips',
    'Lucky',
    'Milo',
    'Moby',
    'Moon',
    'Mushroom',
    'Mute',
    'Nemo',
    'Nix',
    'Nod',
    'Noon',
    'Ocean',
    'Odin',
    'Om',
    'Ood',
    'Oz',
    'Pac',
    'Pip',
    'Pluto',
    'Prince',
    'Quad',
    'Quasi',
    'Quid',
    'Quiz',
    'Rag',
    'Red',
    'Rock',
    'Rod',
    'Rollo',
    'Rune',
    'Scarf',
    'Sham',
    'Sid',
    'Sky',
    'Sonic',
    'Stitch',
    'Tik',
    'Tin',
    'Tok',
    'Toof',
    'Ugg',
    'Uma',
    'Uno',
    'Up',
    'Val',
    'Van',
    'Viz',
    'Vox',
    'West',
    'Wham',
    'Wolf',
    'Wood',
    'Yak',
    'York',
    'Yoyo',
    'Yup',
    'Zed',
    'Zero',
    'Zoot',
    'Zulu'
];
