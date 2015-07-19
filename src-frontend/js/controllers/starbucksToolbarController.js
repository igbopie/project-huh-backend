'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('StarbucksToolbarCtrl', ['$scope', '$http', '$location', 'AuthService', '$mdToast',
        function ($scope, $http, $location, AuthService, $mdToast) {
            $scope.username = AuthService.getUsername();

            $scope.logout = function () {
                AuthService.logout();
                $location.path('starbucks/login');
            };
        }]);
