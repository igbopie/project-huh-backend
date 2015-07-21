'use strict';

var angular = require('angular');
var services = require('../services');

/* Services */
services.service('FlagService', function ($http, AuthService) {
    var urlBase = '/api/flag';

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
});
