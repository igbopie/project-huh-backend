'use strict';
var NotificationService = require('../models/notification').Service,
    ApiUtils = require('../utils/apiutils');


exports.list = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        var pagination = ApiUtils.getPaginationParams(req);
        NotificationService.list(authUser._id, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
    });
};

exports.markAllAsRead = function (req, res) {
    ApiUtils.auth(req, res, function (authUser) {
        NotificationService.markAllAsRead(authUser._id, ApiUtils.handleResult(req, res));
    });
};

