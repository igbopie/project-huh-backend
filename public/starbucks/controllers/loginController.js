/**
 * Created by igbopie on 11/16/14.
 */

define(['angular', 'controllers'], function (angular, controllers) {

  /* Controllers */

  return controllers

    .controller('LoginCtrl', ['$scope', '$http', "$location", "AuthService",
      function ($scope, $http, $location, AuthService) {
        $scope.login = function (username, password) {
          if (AuthService.isLoggedIn()) {
            $location.path('templates');
          } else {
            AuthService.login(username, password, function (success) {
              if (success) {
                $location.path('templates');
              }
            })
          }
        }
      }]);

});