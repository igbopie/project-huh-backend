'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var directives = require('../directives');

directives
    .directive('huhQuestion', function (QuestionService, $location) {
        return {
            restrict: 'E',
            scope: {
                question: '=question',
                withToken: '=withToken'
            },
            templateUrl: 'partials/directives/question.html',
            link: function ($scope, element, attrs) {
                $scope.voteUp = function () {
                    QuestionService.voteUp($scope.question._id, function (err, question) {
                        if (err) {
                            return;
                        }
                        $scope.question = question;
                    });
                };
                $scope.voteDown = function () {
                    QuestionService.voteDown($scope.question._id, function (err, question) {
                        if (err) {
                            return;
                        }
                        $scope.question = question;
                    });
                };

                $scope.goToQuestion = function () {
                    if ($scope.withToken) {
                        $location.path('starbucks/questions/' + $scope.question._id);
                    }
                };
            }
        };
    }
);
