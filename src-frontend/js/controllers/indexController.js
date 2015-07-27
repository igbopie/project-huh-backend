'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('IndexCtrl',
    function ($scope, $http, $location, QuestionService, RegistrationService) {

        $scope.done = false;
        $scope.err = false;
        $scope.already = false;
        $scope.loading = false;

        $scope.register = function () {
            if (!$scope.platform || !$scope.platform.trim()) {
                return;
            }
            $scope.loading = true;
            RegistrationService.create($scope.email, $scope.platform, function (err) {
                $scope.loading = false;
                if (err &&
                    err.code === 400 &&
                    err.message &&
                    err.message.code === 400102) {
                    $scope.already = true;
                } else if (err) {
                    $scope.err = true;
                } else {
                    $scope.done = true;
                }
            });
        };

        $scope.reset = function () {
            $scope.done = false;
            $scope.err = false;
            $scope.already = false;
            $scope.loading = false;
            $scope.err = undefined;
            $scope.email = undefined;
            $scope.platform = undefined;
        };

    });
