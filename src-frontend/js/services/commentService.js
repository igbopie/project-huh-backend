'use strict';
var angular = require("angular");
var services = require("../services");
  /* Services */
services.service('CommentService', function ($http) {
  var urlBase = '/api/comment';

  ///api/comment/list
  this.list = function (questionId, callback) {
    $http.post(urlBase + "/list", {questionId: questionId}).success(function (data) {
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