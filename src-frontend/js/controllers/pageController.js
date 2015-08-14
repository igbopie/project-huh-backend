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
            if (page) {
                $scope.url = page.url;
                $scope.html = page.html;
            } else {
                $scope.html = '<h1>404 Not found</h1><p>The page you are trying to see does not exists.</p>';
            }
        });
    });
