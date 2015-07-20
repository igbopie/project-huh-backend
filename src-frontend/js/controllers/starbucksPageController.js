'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../controllers');
var services = require('../services');

controllers
    .controller('StarbucksPageCtrl',
    function ($scope, $http, $location, $stateParams, PageService, $mdToast) {
        var id;
        if ($stateParams.url !== 'create') {
            $scope.loading = true;
            PageService.view($stateParams.url, function (err, page) {
                $scope.loading = false;
                $scope.url = page.url;
                $scope.html = page.html;
                id = page._id;
            });
        }

        $scope.cancel = function () {
            $location.path('starbucks/pages');
        };

        $scope.save = function (err, newId) {
            $scope.loading = true;
            PageService.createOrUpdate(id, $scope.url, $scope.html, function (err) {
                $scope.loading = false;
                if (err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('There was an error')
                            .position('top right')
                            .hideDelay(3000)
                    );
                    return;
                }
                id = newId;
                $location.path('starbucks/pages/' + $scope.url);
                $mdToast.show(
                    $mdToast.simple()
                        .content('Saved')
                        .position('top right')
                        .hideDelay(3000)
                );
            });
        };
    });
