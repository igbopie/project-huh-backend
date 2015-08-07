'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksQuestionsCtrl',
        function ($scope, $http, $location, AuthService, QuestionService, $mdToast) {
            $scope.questions = [];

            QuestionService.recent(function (err, questions) {
                $scope.questions = questions;
            });

            $scope.createQuestion = function () {
                $location.path('/starbucks/question/create');
            };

        });
