'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksDashboardCtrl',
    function ($scope, $http, $location, $stateParams, StarbucksService) {
        StarbucksService.dashboard( function (err, data) {
            $scope.stats = data;
        });
    });
