var QuestionService = require('../models/question').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    var text = req.body.text;
    var userId = req.body.userId;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var type = req.body.type;
    QuestionService.create(type, text, latitude, longitude, userId, function (err, results) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, results);
      }
    });
};

exports.list = function (req, res) {
  QuestionService.list( function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};
