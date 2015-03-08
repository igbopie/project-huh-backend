/**
 * Created by igbopie on 11/16/14.
 */

'use strict';

define(['angular', 'app'], function (angular, app) {

  return app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/index.html',
        controller: 'IndexCtrl'
      }).
      otherwise({
        redirectTo: '/templates'
      });
  }]);
});