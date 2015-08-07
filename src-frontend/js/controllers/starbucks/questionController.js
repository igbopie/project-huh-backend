'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksQuestionCtrl',
        function ($scope, $location, AuthService, QuestionService, CommentService, $stateParams) {
            $scope.comments = [];

            $scope.question = {};
            QuestionService.view($stateParams.questionId, function (err, question) {
                $scope.question = question;
            });

            CommentService.list($stateParams.questionId, function (err, comments) {
                $scope.comments = comments;
            });

            $scope.createComment = function () {
                CommentService.create($scope.newComment, $scope.question._id, function (err, comment) {
                    if (err) {
                        return;
                    }
                    $scope.newComment = '';
                    $scope.comments.unshift(comment);
                });

            };

        });
