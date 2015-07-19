'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('StarbucksIndexCtrl',
    function ($scope, $http, $location, $stateParams, AuthService) {
        if (AuthService.isLoggedIn()) {
            $location.path('starbucks/dashboard');
        } else {
            $location.path('starbucks/login');
        }
    });
