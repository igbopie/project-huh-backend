'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksCommentCtrl',
        /*jshint maxparams:1000 */
        function ($scope,
                  $location,
                  AuthService,
                  CommentService,
                  QuestionService,
                  $stateParams,
                  $mdDialog,
                  $mdToast) {
            $scope.comment = {};
            $scope.question = {};
            CommentService.view($stateParams.commentId, function (err, comment) {
                $scope.comment = comment;
                comment.selected = ($stateParams.selected === 'true');

                QuestionService.view(comment.questionId, function (err, question) {
                    $scope.question = question;
                });
            });
        });
