/**
 * Created by igbopie on 11/16/14.
 */

define(['../../libs/angular/angular.min', 'controllers'], function (angular, controllers) {

  /* Controllers */

  return controllers


    .controller('MapIconList', ['$scope', '$routeParams', "MapIconService",
      function ($scope, $routeParams, MapIconService) {

        $scope.list = function () {
          $scope.loading = true;
          MapIconService.list(function (err, data) {

            $scope.mapicons = data;
            $scope.loading = false;
          });
        }
        $scope.list();

        $scope.remove = function (id) {
          $scope.loading = true;
          MapIconService.remove(id, function (err) {
            $scope.list();
          });
        };

      }])

    .controller('MapIconCreate', ['$scope', "MediaService", "MapIconService", "$location", function ($scope, MediaService, MapIconService, $location) {
      $scope.loading = false;

      $scope.onFileSelect = function ($files) {
        $scope.loading = true;
        MediaService.createMedia(
          $files,
          function (progress) {

          },
          function (mediaId) {
            $scope.mediaId = mediaId;
            MediaService.getMedia(mediaId, "thumb", function (url) {
              $scope.imgSrc = url;
              $scope.loading = false;
            });

          }
        );
      };
      $scope.removeImage = function () {
        $scope.mediaId = undefined;
        $scope.imgSrc = undefined;
      }

      $scope.save = function (name, tag, mediaId, pointsThreshold, packId) {
        $scope.loading = true;
        MapIconService.create(name, tag, mediaId, pointsThreshold, packId, function (err, templateId) {
          if (!err) {
            $scope.loading = false;
            $location.path('mapicon');
          }
        });
      }
    }])


    .controller('MapIconEdit', ['$scope', "MediaService", "MapIconService", "$location", "$routeParams",
      function ($scope, MediaService, MapIconService, $location, $routeParams) {
        console.log($routeParams.id);

        $scope.loading = true;
        MapIconService.view($routeParams.id, function (err, template) {
          $scope.name = template.name;
          $scope.tag = template.tag;
          $scope.mediaId = template.mediaId;
          $scope.pointsThreshold = template.pointsThreshold;
          $scope.packId = template.packId;
          MediaService.getMedia(template.mediaId, "thumb", function (url) {
            $scope.imgSrc = url;
            $scope.template = template;
            $scope.loading = false;
          });

        });

        $scope.removeImage = function () {
          $scope.mediaId = undefined;
          $scope.imgSrc = undefined;

        }

        $scope.onFileSelect = function ($files) {
          $scope.loading = true;
          MediaService.createMedia(
            $files,
            function (progress) {

            },
            function (mediaId) {
              $scope.mediaId = mediaId;
              MediaService.getMedia(mediaId, "thumb", function (url) {
                $scope.imgSrc = url;
                $scope.loading = false;
              });

            }
          );
        };
        $scope.save = function (name, tag, mediaId, pointsThreshold, packId) {
          $scope.loading = true;
          MapIconService.update($routeParams.id, name, tag, mediaId, pointsThreshold, packId, function (err, templateId) {
            if (!err) {
              $scope.loading = false;
              $location.path('mapicon');
            }
          });
        }
      }]);

});