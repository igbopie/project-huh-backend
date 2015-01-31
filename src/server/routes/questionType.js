var QuestionTypeService = require('../models/questionType').Service;
var ApiUtils = require('../utils/apiutils');


exports.list = function (req, res) {
  QuestionTypeService.list( function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};
