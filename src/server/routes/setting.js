var SettingsService = require('../models/setting').Service;
var ApiUtils = require('../utils/apiutils');

exports.update = function (req, res) {
  var name = req.body.name;
  var userId = req.body.userId;
  var value = req.body.value;
  SettingsService.update(name, value, userId, ApiUtils.handleResult(req, res));
};

exports.list = function (req, res) {
  var userId = req.body.userId;
  SettingsService.findAll(userId, ApiUtils.handleResult(req, res));
};
