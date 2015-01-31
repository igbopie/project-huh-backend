'use strict';

define(['../../libs/angular/angular.min', 'services'], function (angular, services) {
  /* Services */
  return services

    .service('ReportService', ['$http', 'AuthService', function ($http, AuthService) {

      var urlBase = '/api/report';

      this.list = function (callback) {
        $http.post(urlBase + "/list", {token: AuthService.getToken()}).success(function (data) {
          if (data.response) {
            callback(null, data.response);
          } else {
            callback(data.code);
          }
        }).error(function (error) {
          callback(error);
        });
      };

    }]);
});