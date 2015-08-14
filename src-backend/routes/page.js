'use strict';
var PageService = require('../models/page').Service,
    ApiUtils = require('../utils/apiutils');

exports.list = function (req, res) {
    ApiUtils.authAdmin(req, res, function (authUser) {
        PageService.list(ApiUtils.handleResult(req, res));
    });
};

exports.view = function (req, res) {
    var url = req.body.url || req.params.url;
    PageService.view(url, ApiUtils.handleResult(req, res));
};

exports.create = function (req, res) {
    ApiUtils.authAdmin(req, res, function (authUser) {
        var url = req.body.url,
            html = req.body.html;
        PageService.create(url, html, ApiUtils.handleResult(req, res));
    });
};

exports.update = function (req, res) {
    ApiUtils.authAdmin(req, res, function (authUser) {
        var id = req.body.id,
            url = req.body.url,
            html = req.body.html;
        PageService.update(id, url, html, ApiUtils.handleResult(req, res));
    });
};
