'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('PageCtrl',
    function ($scope, $http, $location, $stateParams, PageService) {
        $scope.loading = true;
        PageService.view($stateParams.url, function (err, page) {
            $scope.loading = false;
            $scope.url = page.url;
            $scope.html = page.html;
        });
    });
