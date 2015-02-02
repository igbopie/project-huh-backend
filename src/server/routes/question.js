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
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }

  QuestionService.list(userId, page, numItems, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};
