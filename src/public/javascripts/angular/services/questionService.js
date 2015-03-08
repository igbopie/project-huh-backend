'use strict';

define(['angular', 'services'], function (angular, services) {
  /* Services */
  return services

    .service('QuestionService', ['$http', function ($http) {

      var urlBase = '/api/question';

      this.recent = function (callback) {
        $http.post(urlBase + "/recent", {}).success(function (data) {
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