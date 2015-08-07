'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var directives = require('../directives');

directives
    .directive('huhComment', function (CommentService) {
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
            }
        };
    }
);
