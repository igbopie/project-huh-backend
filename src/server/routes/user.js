var UserService = require('../models/user').Service;
var ApiUtils = require('../utils/apiutils');
var Q = require("q");


exports.create = function (req, res) {
  UserService.create(function (err, user) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK_CREATED, null, user._id);
    }
  });
};


exports.addApnToken = function (req, res) {
  var userId = req.body.userId;
  var apntoken = req.body.apntoken;
  UserService.addApnToken(apntoken, userId, function (err) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, null);
    }
  });
}


exports.removeApnToken = function (req, res) {
  var userId = req.body.userId;
  UserService.removeApnToken(userId, function (err) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, null);
    }
  });
}


exports.addGcmToken = function (req, res) {
  var userId = req.body.userId;
  var gcmtoken = req.body.gcmtoken;
  UserService.addGcmToken(gcmtoken, userId, function (err) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, null);
    }
  });
}

exports.removeGcmToken = function (req, res) {
  var userId = req.body.userId;
  UserService.removeGcmToken(userId, function (err) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, null);
    }
  });
};

