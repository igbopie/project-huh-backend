'use strict';
var NotificationService = require('../models/notification').Service,
    ApiUtils = require('../utils/apiutils');


exports.list = function (req, res) {
    var userId = req.body.userId,
        pagination = ApiUtils.getPaginationParams(req);
    NotificationService.list(userId, pagination.page, pagination.numItems, ApiUtils.handleResult(req, res));
};

exports.markAllAsRead = function (req, res) {
    var userId = req.body.userId;
    NotificationService.markAllAsRead(userId, ApiUtils.handleResult(req, res));
};

