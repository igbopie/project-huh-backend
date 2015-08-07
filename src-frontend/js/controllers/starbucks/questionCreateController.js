'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksQuestionCreateCtrl',
        function ($scope, $location, AuthService, QuestionService, CommentService, $stateParams) {
            $scope.questionTypes = [];
            $scope.questionTypesSelected = [];
            QuestionService.listQuestionTypes(function (err, types) {
                if (err) {
                    return;
                }
                $scope.questionTypes = types;
                if ($scope.questionTypes.length > 0) {
                    $scope.questionTypesSelected = [$scope.questionTypes[0]];
                }
            });

            $scope.select = function ($type) {
                if ($scope.questionTypesSelected.length === 1) {
                    $scope.questionTypesSelected = $scope.questionTypes;
                } else {
                    $scope.questionTypesSelected = [$type];
                }

            };

            $scope.create= function () {
                QuestionService.create(
                    $scope.text,
                    $scope.questionTypesSelected[0].word,
                    0,
                    0,
                    function (err, question) {
                        if (err) {
                            return;
                        }
                        $location.path('starbucks/questions');

                    }
                );
            };

        });
