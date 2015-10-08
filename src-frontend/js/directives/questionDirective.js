'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var directives = require('../directives');

directives
    .directive('huhQuestion', function (QuestionService, $location, $mdToast) {
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

                $scope.delete = function () {
                    if ($scope.withToken) {
                        QuestionService.delete($scope.question._id, function(err){
                            if (err) {
                                $mdToast.show($mdToast.simple()
                                    .content('There was an error')
                                    .position('top right')
                                    .hideDelay(3000));
                                return;
                            }
                            $scope.question = undefined;
                            $mdToast.show($mdToast.simple()
                                .content('Question was deleted')
                                .position('top right')
                                .hideDelay(3000));
                            $location.path('starbucks/questions');
                        });
                    }
                };

                $scope.onSwipeLeft = function () {
                    if ($scope.withToken) {
                        $scope.swiped = true;
                    }
                };

                $scope.onSwipeRight = function () {
                    $scope.swiped = false;
                };
            }
        };
    }
);
