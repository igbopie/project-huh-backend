'use strict';

var angular = require('angular');
var services = require('../services');

/* Services */
services.service('PageService', function ($http, AuthService) {
    var urlBase = '/api/page';

    this.list = function (callback) {
        $http.post(urlBase + '/list', {token: AuthService.getToken()}).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.view = function (url, callback) {
        if (url === 'privacy-policy') {
            $http.get('http://www.iubenda.com/api/privacy-policy/145989').success(function (data) {
                if (data.success) {
                    callback(null,
                        {
                            url: 'privacy-policy',
                            html: data.content
                        }
                    );
                } else {
                    callback(data);
                }
            }).error(function (error) {
                callback(error);
            });
        }else {
            $http.post(urlBase + '/view', {url: url}).success(function (data) {
                if (data.response) {
                    callback(null, data.response);
                } else {
                    callback(data.code);
                }
            }).error(function (error) {
                callback(error);
            });
        }
    };

    this.createOrUpdate = function (id, url, html, callback) {
        if (!id) {
            $http.post(
                urlBase + '/create',
                {url: url, html: html, token:AuthService.getToken()}
            ).success(function (data) {
                if (data.response) {
                    callback(null, data.response);
                } else {
                    callback(data.code);
                }
            }).error(function (error) {
                callback(error);
            });
        } else {
            $http.post(
                urlBase + '/update',
                {id: id, url: url, html: html, token: AuthService.getToken()}
            ).success(function (data) {
                if (data.response) {
                    callback(null, data.response);
                } else {
                    callback(data.code);
                }
            }).error(function (error) {
                callback(error);
            });
        }
    };
});
