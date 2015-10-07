'use strict';
var angular = require('angular');
var services = require('../services');
/* Services */
services.service('CommentService', function ($http, AuthService) {
    var urlBase = '/api/comment',
        voteUrlBase = '/api/vote';
    // /api/comment/list
    this.list = function (questionId, callback) {
        $http.post(urlBase + '/list', {questionId: questionId, token: AuthService.getToken()}).success(function (data) {
            if (data.response) {
                callback(null, data.response);
            } else {
                callback(data.code);
            }
        }).error(function (error) {
            callback(error);
        });
    };

    this.voteUp = function (commentId, callback) {
        $http.post(
            voteUrlBase + '/up',
            {commentId: commentId, token: AuthService.getToken()}
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

    this.voteDown = function (commentId, callback) {
        $http.post(
            voteUrlBase + '/down',
            {commentId: commentId, token: AuthService.getToken()}
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

    this.create = function (text, questionId, callback) {
        $http.post(
            urlBase + '/create',
            {text:text, questionId: questionId, token: AuthService.getToken()}
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

    this.view = function (commentId, callback) {
        $http.post(
            urlBase + '/view',
            {commentId: commentId, token: AuthService.getToken()}
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
