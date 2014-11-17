/**
 * Created by igbopie on 11/16/14.
 */


define(['angular','controllers'], function (angular,controllers) {

  /* Controllers */

  return controllers

  .controller('NavCtrl', ['$scope', '$routeParams',"AuthService","$location","$window",
  function($scope, $routeParams,AuthService,$location,$window) {

    if ($location.protocol() != 'https' && location.hostname != "localhost") {
      $window.location.href = $location.absUrl().replace('http', 'https');
    }

    $scope.isLoggedIn = AuthService.isLoggedIn();
    $scope.username = AuthService.getUsername();

    if(!$scope.isLoggedIn && $location.path() != "/login" ){
      $location.path('login');
    }
    if($scope.isLoggedIn && $location.path() == "/login" ){
      $location.path('templates');
    }
    $scope.location =  $location.path();

    $scope.$on('$routeChangeSuccess', function () {
      if(!$scope.isLoggedIn && $location.path() != "/login" ){
        $location.path('login');
      }
      if($scope.isLoggedIn && $location.path() == "/login" ){
        $location.path('templates');
      }
      $scope.location =  $location.path();
    })



    AuthService.setLoginNotification(function(){
      $scope.isLoggedIn = AuthService.isLoggedIn();
      $scope.username = AuthService.getUsername();
    })

    $scope.logout = function(){
      AuthService.logout();
      $location.path('login');
    }

  }]);

});