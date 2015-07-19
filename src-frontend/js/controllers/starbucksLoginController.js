'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('StarbucksLoginCtrl', ['$scope', '$http', '$location', 'AuthService', '$mdToast',
        function ($scope, $http, $location, AuthService, $mdToast) {
            $scope.loading = false;
            if (AuthService.isLoggedIn()) {
                $location.path('starbucks');
            }
            $scope.login = function (username, password) {
                if (AuthService.isLoggedIn()) {
                    $location.path('starbucks');
                } else {
                    $scope.loading = true;
                    AuthService.login(username, password, function (success) {
                        $scope.loading = false;
                        if (success) {
                            $location.path('starbucks');
                        } else {
                            $mdToast.show(
                                $mdToast.simple()
                                    .content('Invalid your credentials')
                                    .position('top right')
                                    .hideDelay(3000)
                            );
                        }
                    });
                }
            };
        }]);
