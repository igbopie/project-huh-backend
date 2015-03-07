var QuestionTypeService = require('../models/questionType').Service;
var ApiUtils = require('../utils/apiutils');


exports.list = function (req, res) {
  QuestionTypeService.list(ApiUtils.handleResult(req, res));
};
