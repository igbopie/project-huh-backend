/**
 * Created by igbopie on 11/16/14.
 */

define(['../../libs/angular/angular.min', 'controllers'], function (angular, controllers) {

  /* Controllers */

  return controllers

    .controller('ListReportsCtrl', ['$scope', '$routeParams', "ReportService",
      function ($scope, $routeParams, ReportService) {

        $scope.list = function () {
          $scope.loading = true;
          ReportService.list(function (err, data) {
            $scope.reports = data;
            $scope.loading = false;
          });
        }

        $scope.list();

      }]);

});