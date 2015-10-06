'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksQuestionCtrl',
        function ($scope, $location, AuthService, QuestionService, CommentService, $stateParams, $mdDialog, $mdToast) {
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

            $scope.removeQuestion = function() {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete this question?')
                    .content('If you delete it, it will be <b>gone</b> forever. Well... maybe you can find it somewhere in the DB.')
                    .ok('OK')
                    .cancel('Opps!! no please, don\'t delete me');

                $mdDialog.show(confirm).then(function() {
                    QuestionService.delete($stateParams.questionId, function(err, question) {
                        if (err) {
                            $mdToast.simple()
                                .content('There was an error')
                                .position('top right')
                                .hideDelay(3000);
                            console.error(err);
                        } else {
                            $scope.question = {};
                            $scope.comments = [];
                        }
                    });
                }, function() {
                    // nothing here
                });
            };


        });
