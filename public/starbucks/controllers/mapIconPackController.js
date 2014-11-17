/**
 * Created by igbopie on 11/16/14.
 */

define(['angular','controllers'], function (angular,controllers) {

/* Controllers */

  return controllers

  .controller('MapIconPackList', ['$scope', '$routeParams',"MapIconPackService",
    function($scope, $routeParams,MapIconPackService) {

      $scope.list = function() {
        $scope.loading = true;
        MapIconPackService.list(function (err, data) {

          $scope.mapicons = data;
          $scope.loading = false;
        });
      }
      $scope.list();

      $scope.remove = function(id){
        $scope.loading = true;
        MapIconPackService.remove(id,function(err){
          $scope.list();
        });
      };

    }])

  .controller('MapIconPackCreate',[ '$scope',"MediaService","MapIconPackService","$location", function($scope,MediaService,MapIconPackService,$location) {
    $scope.loading = false;
    $scope.isFree = true;

    $scope.onFileSelect = function($files) {
      $scope.loading = true;
      MediaService.createMedia(
        $files,
        function(progress){

        },
        function(mediaId){
          $scope.mediaId = mediaId;
          MediaService.getMedia(mediaId,"thumb",function(url){
            $scope.imgSrc = url;
            $scope.loading = false;
          });

        }
      );
    };
    $scope.removeImage = function(){
      $scope.mediaId = undefined;
      $scope.imgSrc = undefined;
    }

    $scope.save = function(name,tag,mediaId,pointsThreshold,isFree,appStoreCode){
      $scope.loading = true;
      MapIconPackService.create(name,tag,mediaId,pointsThreshold,isFree,appStoreCode,function(err,templateId){
        if(!err){
          $scope.loading = false;
          $location.path('mapiconpack');
        }
      });
    }
  }])


  .controller('MapIconPackEdit',[ '$scope',"MediaService","MapIconPackService","$location","$routeParams",
    function($scope,MediaService,MapIconPackService,$location,$routeParams) {
      console.log($routeParams.id);

      $scope.loading = true;
      MapIconPackService.view($routeParams.id,function(err,template){
        $scope.name = template.name;
        $scope.mediaId = template.mediaId;
        $scope.pointsThreshold = template.pointsThreshold;
        $scope.isFree = template.isFree;
        $scope.appStoreCode = template.appStoreCode;

        MediaService.getMedia(template.mediaId,"thumb",function(url){
          $scope.imgSrc = url;
          $scope.template = template;
          $scope.loading = false;
        });

      });

      $scope.removeImage = function(){
        $scope.mediaId = undefined;
        $scope.imgSrc = undefined;

      }

      $scope.onFileSelect = function($files) {
        $scope.loading = true;
        MediaService.createMedia(
          $files,
          function(progress){

          },
          function(mediaId){
            $scope.mediaId = mediaId;
            MediaService.getMedia(mediaId,"thumb",function(url){
              $scope.imgSrc = url;
              $scope.loading = false;
            });

          }
        );
      };
      $scope.save = function(name,tag,mediaId,pointsThreshold,isFree,appStoreCode){
        $scope.loading = true;
        MapIconPackService.update($routeParams.id,name,tag,mediaId,pointsThreshold,isFree,appStoreCode,function(err,templateId){
          if(!err){
            $scope.loading = false;
            $location.path('mapiconpack');
          }
        });
      }
    }]);


});