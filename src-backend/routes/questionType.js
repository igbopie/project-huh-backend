'use strict';
var QuestionTypeService = require('../models/questionType').Service,
    ApiUtils = require('../utils/apiutils');

exports.list = function (req, res) {
    QuestionTypeService.list(ApiUtils.handleResult(req, res));
};
