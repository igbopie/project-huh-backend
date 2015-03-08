/**
 * Created by igbopie on 02/09/14.
 */

define([
  '../libs/angular/angular.min',
  'angularRoute',
  'angularCookies',
  'angularFileUpload',

  'services',
  'services/mapIconService',
  'services/mapIconPackService',
  'services/mediaService',
  'services/templateService',
  'services/authService',
  'services/reportService',
  'directives',

  'controllers',
  'controllers/mapIconController',
  'controllers/mapIconPackController',
  'controllers/templateController',
  'controllers/navController',
  'controllers/loginController',
  'controllers/reportController'
], function (angular) {

  return angular.module('markStarbucks', [
    'ngRoute',
    'ngCookies',
    'angularFileUpload',
    'markStarbucks.services',
    'markStarbucks.directives',
    'markStarbucks.controllers'
  ]);
});
