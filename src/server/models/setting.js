var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , dateUtils = require('date-utils')
  ;

var NOTIFICATIONS = [
  {name:"OnQuestionPosted", defaultValue: true, title:"New Question", description:"Send me a notification when a new question is posted."},
  {name:"OnCommentOnMyQuestion", defaultValue: true, title:"Comment on my Question", description:"Send me a notification when someone comments on my question."},
  {name:"OnCommentOnMyComment", defaultValue: true, title:"Comment on my Comment", description:"Send me a notification when someone comments on a question I'm participating in."},
  {name:"OnUpVoteOnMyQuestion", defaultValue: true, title:"+1 My Question", description:"My Question was up voted."},
  {name:"OnDownVoteOnMyQuestion", defaultValue: true, title:"-1 My Question", description:"My Question was down voted."},
  {name:"OnUpVoteOnMyComment", defaultValue: true, title:"+1 My Comment", description:"My Comment was up voted."},
  {name:"OnDownVoteOnMyComment", defaultValue: true, title:"-1 My Comment", description:"My Comment was up down voted."}
];


var settingsSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true, ref: "User"},
  created: {type: Date, required: true, default: Date.now},
  modified: {type: Date, required: true, default: Date.now},
  name: {type: String, required: true},
  value: {type: Schema.Types.Mixed, required: true}
});
settingsSchema.index({userId: 1, name: 1}, {unique: true});

var Setting = mongoose.model('Settings', settingsSchema);

//Service
var service = {};

service.update = function (name, value, userId, callback) {
  Setting.findOne({userId: userId, name: name}, function(err, setting) {
    if (err) return callback(err);

    if (!setting) {
      setting = new Setting();
      setting.userId = userId;
      setting.name = name;
    }
    setting.value = value;
    setting.modified = Date.now();
    setting.save(function (err) {
      callback(err, setting);
    });
  });
};

service.findOne = function (name, userId, callback) {
  User.findOne({userId: userId, name: name}, callback);
};

service.findAll = function (userId, callback) {
  Setting.find({userId: userId}, function(err, userSettings){
    if (err) return callback(err);
    var mapSettings = {};

    for(var index in userSettings){
      var userSetting = userSettings[index];
      mapSettings[userSetting.name] = userSetting;
    }

    var totalSettings = [];
    for (var key in NOTIFICATIONS) {
      var notification = NOTIFICATIONS[key];
      var finalSetting = {};
      finalSetting.name = notification.name;
      finalSetting.title = notification.title;
      finalSetting.description = notification.description;
      finalSetting.value = notification.defaultValue;

      var userSetting = mapSettings[notification.name];
      if (userSetting) {
        finalSetting.value = userSetting.value;
        finalSetting.created = userSetting.created;
        finalSetting.modified = userSetting.modified;
      }

      totalSettings.push(finalSetting);
    }

    callback(null, totalSettings);

  });
};




module.exports = {
  Service: service
};


