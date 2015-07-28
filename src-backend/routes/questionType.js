'use strict';
var QuestionTypeService = require('../models/questionType').Service,
    ApiUtils = require('../utils/apiutils');

exports.list = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        QuestionTypeService.list(ApiUtils.handleResult(req, res));
    });
};
