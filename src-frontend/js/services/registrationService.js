'use strict';

var angular = require('angular');
var services = require('../services');

/* Services */
services.service('RegistrationService', function ($http, AuthService) {
    var urlBase = '/api/registration';
    this.create = function (email, platform, callback) {
        $http.post(urlBase + '/create', {email: email, platform: platform}).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };
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
