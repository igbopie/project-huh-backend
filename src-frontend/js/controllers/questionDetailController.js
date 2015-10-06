'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('QuestionDetailCtrl',
    function ($scope, $http, $location, $stateParams, QuestionService, CommentService) {

        $scope.question = {};
        QuestionService.view($stateParams.questionId, function (err, question) {
            $scope.question = question;
        });

        CommentService.list($stateParams.questionId, function (err, comments) {
            $scope.comments = comments;
        });
    });
