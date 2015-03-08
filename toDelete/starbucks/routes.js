/**
 * Created by igbopie on 11/16/14.
 */

'use strict';

define(['../libs/angular/angular.min', 'app'], function (angular, app) {

  return app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }).
      when('/templates', {
        templateUrl: 'partials/templates.html',
        controller: 'ListTemplateCtrl'
      }).
      when('/templates/create', {
        templateUrl: 'partials/templates-create.html',
        controller: 'CreateTemplateCtrl'
      }).
      when('/templates/edit/:id', {
        templateUrl: 'partials/templates-create.html',
        controller: 'EditTemplateCtrl'
      }).
      when('/mapicon', {
        templateUrl: 'partials/mapicon.html',
        controller: 'MapIconList'
      }).
      when('/mapicon/create', {
        templateUrl: 'partials/mapicon-create.html',
        controller: 'MapIconCreate'
      }).
      when('/mapicon/edit/:id', {
        templateUrl: 'partials/mapicon-create.html',
        controller: 'MapIconEdit'
      }).
      when('/mapiconpack', {
        templateUrl: 'partials/mapiconpack.html',
        controller: 'MapIconPackList'
      }).
      when('/mapiconpack/create', {
        templateUrl: 'partials/mapiconpack-create.html',
        controller: 'MapIconPackCreate'
      }).
      when('/mapiconpack/edit/:id', {
        templateUrl: 'partials/mapiconpack-create.html',
        controller: 'MapIconPackEdit'
      })
      .when('/reports', {
        templateUrl: 'partials/reports.html',
        controller: 'ListReportsCtrl'
      }).
      otherwise({
        redirectTo: '/templates'
      });
  }]);
});