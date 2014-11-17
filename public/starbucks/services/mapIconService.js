
'use strict';

define(['angular','services'], function (angular,services) {
  /* Services */
  return services

  .service('MapIconService', ['$http','AuthService', function ($http,AuthService) {

    var urlBase = '/api/mapicon';

    this.list = function (callback) {
      $http.post(urlBase,{token:AuthService.getToken()}).success(function(data) {
        if(data.response){
          callback(null,data.response);
        }else{
          callback(data.code);
        }
      }).error(function (error) {
        callback(error);
      });
    };

    this.view = function (id,callback) {
      $http.post(urlBase+'/view',{id:id,token:AuthService.getToken()}).success(function(data) {
        if(data.response){
          callback(null,data.response);
        }else{
          callback(data.code);
        }
      }).error(function (error) {
        callback(error);
      });
    };

    this.update = function (id,name,tag,mediaId,pointsThreshold,packId,callback) {
      $http.post(urlBase+'/update',{id:id,name:name,tag:tag,mediaId:mediaId,token:AuthService.getToken(),pointsThreshold:pointsThreshold,packId:packId}).success(function(data) {
        if(data.response){
          callback(null,data.response);
        }else{
          callback(data.code);
        }
      }).error(function (error) {
        callback(error);
      });
    };

    this.create = function(name,tag,mediaId,pointsThreshold,packId,callback){
      $http.post(urlBase+"/create",{token:AuthService.getToken(),name:name,tag:tag,mediaId:mediaId,pointsThreshold:pointsThreshold,packId:packId}).success(function(data) {
        if(data.response){
          callback(null,data.response);
        }else{
          callback(data.code);
        }
      }).error(function (error) {
        callback(error);
      });
    }
    this.remove = function(id,callback){
      $http.post(urlBase+"/remove",{token:AuthService.getToken(),id:id}).success(function(data) {
        if(data.code == 200){
          callback(null);
        }else{
          callback(data.code);
        }
      }).error(function (error) {
        callback(error);
      });
    }
  }]);
});