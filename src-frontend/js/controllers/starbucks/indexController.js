'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksIndexCtrl',
    function ($scope, $http, $location, $stateParams, AuthService, HttpsService) {
        if (HttpsService.force()) {return;}

        if (!AuthService.isLoggedIn()) {
            $location.path('starbucks/login');
            return;
        }
        if ($location.path() === '/starbucks') {
            $location.path('starbucks/dashboard');
        }
    });
