'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('StarbucksPagesCtrl',
    function ($scope, $http, $location, $stateParams, PageService) {
        $scope.pages = [];
        PageService.list(function (err, pages) {
            $scope.pages = pages;
        });

        $scope.createPage = function () {
            $location.path('starbucks/pages/create');
        };

        $scope.edit = function (page) {
            $location.path('starbucks/pages/' + page.url);
        };
    });
