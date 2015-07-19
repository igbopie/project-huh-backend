'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('IndexCtrl',
    function ($scope, $http, $location, QuestionService) {

        $scope.questions = [];
        QuestionService.recent(function (err, list) {
            $scope.questions = list;
        });

        $scope.goToQuestion = function (question) {
            $location.path('/q/' + question._id);
        };

    });
