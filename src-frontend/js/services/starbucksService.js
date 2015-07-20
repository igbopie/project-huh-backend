'use strict';

var angular = require('angular');
var services = require('../services');

/* Services */
services.service('StarbucksService', function ($http, AuthService) {
    var urlBase = '/api/starbucks';
    this.dashboard = function (callback) {
        $http.post(urlBase + '/dashboard', {token: AuthService.getToken()}).success(function (data) {
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
