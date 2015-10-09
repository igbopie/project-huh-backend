'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var directives = require('../directives');

directives
    .directive('huhComment', function (CommentService, $mdToast, $location, $mdDialog) {
        return {
            restrict: 'E',
            scope: {
                comment: '=comment',
                withToken: '=withToken',
                qColor: '=qColor'
            },
            templateUrl: 'partials/directives/comment.html',
            link: function ($scope, element, attrs) {

                $scope.voteUp = function () {
                    CommentService.voteUp($scope.comment._id, function (err, comment) {
                        if (err) {
                            return;
                        }
                        $scope.comment = comment;
                    });
                };

                $scope.voteDown = function () {
                    CommentService.voteDown($scope.comment._id, function (err, comment) {
                        if (err) {
                            return;
                        }
                        $scope.comment = comment;
                    });
                };

                $scope.onSwipeLeft = function () {
                    if ($scope.withToken) {
                        $scope.swiped = true;
                    }
                };

                $scope.onSwipeRight = function () {
                    $scope.swiped = false;
                };

                $scope.onRightClick = function () {
                    if ($scope.withToken) {
                        $scope.swiped = !$scope.swiped;
                    }
                };

                $scope.onClick = function () {
                    $scope.swiped = false;
                };

                $scope.delete = function (ev) {
                    if ($scope.withToken) {
                        var confirm = $mdDialog.confirm()
                            .title('Are you really sure about this?')
                            .content('You will delete this comment.')
                            .ariaLabel('Delete')
                            .targetEvent(ev)
                            .ok('I am really really sure')
                            .cancel('Nah, just kidding');
                        $mdDialog.show(confirm).then(function () {
                            CommentService.delete($scope.comment._id, function (err) {
                                if (err) {
                                    $mdToast.show($mdToast.simple()
                                        .content('There was an error')
                                        .position('top right')
                                        .hideDelay(3000));
                                    return;
                                }
                                $scope.comment = undefined;
                                $mdToast.show($mdToast.simple()
                                    .content('Comment was deleted')
                                    .position('top right')
                                    .hideDelay(3000));
                            });
                        }, function () {}
                        );

                    }
                };
            }
        };
    }
);
