var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , dateUtils = require('date-utils')
  ;


var userSchema = new Schema({
  created: {type: Date, required: true, default: Date.now},
  modified: {type: Date, required: true, default: Date.now},
  apnToken: {type: String, required: false}, //iOs notification
  apnSubscribeDate: {type: Date, required: false},
  gcmToken: {type: String, required: false}, //Android notification
  gcmSubscribeDate: {type: Date, required: false}
});

var User = mongoose.model('User', userSchema);

//Service
var service = {};

service.create = function (callback) {
  var user = new User();
  user.save(function(err) {
    callback(err, user._id);
  });
};

service.findById = function (id, callback) {
  User.findOne({_id: id}, callback);
};

service.findAll = function (callback) {
  User.find({}, callback);
};

service.addApnToken = function(apnToken, userId, callback) {
  User.findById(userId, function(err, user) {
    if (err) return callback(err);
    user.apnToken = apnToken;
    user.apnSubscribeDate = Date.now();
    user.save(function (err) {
      if (err) return callback(err);

      callback();
    });
  });
}


service.removeApnToken = function (userId, callback) {
  User.findById(userId, function(err, user) {
    user.apnToken = undefined;
    user.apnSubscribeDate = undefined;
    user.save(function (err) {
      if (err) return callback(err);

      callback();
    });
  });
}


service.addGcmToken = function (gcmToken, userId, callback) {
  User.findById(userId, function(err, user) {
    user.gcmToken = gcmToken;
    user.gcmSubscribeDate = Date.now();
    user.save(function (err) {
      if (err) return callback(err);

      callback();
    });
  });
}

exports.removeGcmToken = function (userId, callback) {
  User.findById(userId, function(err, user) {
    user.gcmToken = undefined;
    user.gcmSubscribeDate = undefined;
    user.save(function (err) {
      if (err) return callback(err);

      callback();
    });
  });
};


module.exports = {
  Service: service
};