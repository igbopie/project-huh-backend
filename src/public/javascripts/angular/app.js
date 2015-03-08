/**
 * Created by igbopie on 3/7/15.
 */

/**
 * Created by igbopie on 02/09/14.
 */

define([
  'angular',
  'angularMoment',
  'angularRoute',
  'angularCookies',
  'angularAria',
  'angularAnimate',
  'angularMaterial',

  'services',
  'directives',

  'controllers',
  'controllers/indexController'
], function (angular, angularMoment) {
  var huh = angular.module('huh', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'angularMoment',
    'huh.services',
    'huh.directives',
    'huh.controllers'
  ]);
  huh.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('amber');
  });
  return huh;
});

/*
var app = angular.module('HuhApp', ['ngMaterial']);

app.controller('AppCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

}]);*/