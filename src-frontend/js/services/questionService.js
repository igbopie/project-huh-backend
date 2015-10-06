'use strict';

var angular = require('angular');
var services = require('../services');

/* Services */
services.service('QuestionService', function ($http, AuthService) {
    var urlBase = '/api/question',
        voteUrlBase = '/api/vote';
    this.recent = function (callback) {
        $http.post(urlBase + '/recent', {token: AuthService.getToken()}).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.view = function (questionId, callback) {
        $http.post(urlBase + '/view', {questionId: questionId, token: AuthService.getToken()}).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.voteUp = function (questionId, callback) {
        $http.post(
            voteUrlBase + '/up',
            {questionId: questionId, token: AuthService.getToken()}
        ).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.voteDown = function (questionId, callback) {
        $http.post(
            voteUrlBase + '/down',
            {questionId: questionId, token: AuthService.getToken()}
        ).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.listQuestionTypes = function (callback) {
        $http.post(
            '/api/questiontype/list',
            {token: AuthService.getToken()}
        ).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });

    };

    this.create = function (text, type, latitude, longitude, callback) {
        $http.post(
            '/api/question/create',
            {text: text, type: type, latitude:0, longitude:0, token: AuthService.getToken()}
        ).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });

    };

    this.delete = function (questionId, callback) {
        $http.post(
            '/api/question/delete',
            {questionId:questionId, token: AuthService.getToken()}
        ).success(function (data) {
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
