'use strict';

define(['angular', 'services'], function (angular, services) {
  /* Services */
  return services

    .service('TemplateService', ['$http', 'AuthService', function ($http, AuthService) {

      var urlBase = '/api/template';

      this.getTemplates = function (callback) {
        $http.post(urlBase, {token: AuthService.getToken()}).success(function (data) {
          if (data.response) {
            callback(null, data.response);
          } else {
            callback(data.code);
          }
        }).error(function (error) {
          callback(error);
        });
      };

      this.getTemplate = function (id, callback) {
        $http.post(urlBase + '/view', {id: id, token: AuthService.getToken()}).success(function (data) {
          if (data.response) {
            callback(null, data.response);
          } else {
            callback(data.code);
          }
        }).error(function (error) {
          callback(error);
        });
      };

      this.updateTemplate = function (id, name, price, mediaId, callback) {
        $http.post(urlBase + '/update', {
          id: id,
          name: name,
          price: price,
          mediaId: mediaId,
          token: AuthService.getToken()
        }).success(function (data) {
          if (data.response) {
            callback(null, data.response);
          } else {
            callback(data.code);
          }
        }).error(function (error) {
          callback(error);
        });
      };

      this.createTemplate = function (name, price, mediaId, callback) {
        $http.post(urlBase + "/create", {
          token: AuthService.getToken(),
          name: name,
          price: price,
          mediaId: mediaId
        }).success(function (data) {
          if (data.response) {
            callback(null, data.response);
          } else {
            callback(data.code);
          }
        }).error(function (error) {
          callback(error);
        });
      }
      this.removeTemplate = function (id, callback) {
        $http.post(urlBase + "/remove", {token: AuthService.getToken(), id: id}).success(function (data) {
          if (data.code == 200) {
            callback(null);
          } else {
            callback(data.code);
          }
        }).error(function (error) {
          callback(error);
        });
      }
    }]);
});