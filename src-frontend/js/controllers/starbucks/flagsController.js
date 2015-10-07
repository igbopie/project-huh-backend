'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksFlagsCtrl',
    function ($scope, $http, $location, $stateParams, FlagService) {
        $scope.flags = [];

        $scope.view = function (flag) {
            if (flag.questionId) {
                $location.path('/starbucks/questions/' + flag.questionId);
            } else {
                $location.path('/starbucks/comment/' + flag.commentId);
            }
        };

        FlagService.list(function (err, flags) {
            $scope.flags = flags;
        });
    });
