'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksRegistrationsCtrl',
    function ($scope, $http, $location, $stateParams, RegistrationService) {
        $scope.registrations = [];
        RegistrationService.list(function (err, registrations) {
            $scope.registrations = registrations;
        });


    });
