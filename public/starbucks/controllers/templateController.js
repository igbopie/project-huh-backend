/**
 * Created by igbopie on 11/16/14.
 */

define(['angular', 'controllers'], function (angular, controllers) {

  /* Controllers */

  return controllers


    .controller('ListTemplateCtrl', ['$scope', '$routeParams', "TemplateService", "MediaService",
      function ($scope, $routeParams, TemplateService, MediaService) {

        $scope.loadTemplates = function () {
          $scope.loading = true;
          TemplateService.getTemplates(function (err, data) {

            $scope.templates = data;
            /*
             for (var i = 0; i < $scope.templates.length; i++) {
             (function (template) {
             MediaService.getMedia(template.mediaId, "thumb", function (mediaURL) {
             template.mediaURL = mediaURL;
             })
             })($scope.templates[i]);

             (function (template) {
             MediaService.getMedia(template.teaserMediaId, "thumb", function (mediaURL) {
             template.teaserMediaURL = mediaURL;
             })
             })($scope.templates[i]);
             }*/
            $scope.loading = false;
          });
        }
        $scope.loadTemplates();

        $scope.remove = function (id) {
          $scope.loading = true;
          TemplateService.removeTemplate(id, function (err) {
            $scope.loadTemplates();
          });
        };

      }])

    .controller('CreateTemplateCtrl', ['$scope', "MediaService", "TemplateService", "$location", function ($scope, MediaService, TemplateService, $location) {
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

      $scope.save = function (name, price, mediaId) {
        $scope.loading = true;
        TemplateService.createTemplate(name, price, mediaId, function (err, templateId) {
          if (!err) {
            $scope.loading = false;
            $location.path('templates');
          }
        });
      }
    }])


    .controller('EditTemplateCtrl', ['$scope', "MediaService", "TemplateService", "$location", "$routeParams", function ($scope, MediaService, TemplateService, $location, $routeParams) {
      console.log($routeParams.id);

      $scope.loading = true;
      TemplateService.getTemplate($routeParams.id, function (err, template) {
        $scope.name = template.name;
        $scope.price = template.price;
        $scope.mediaId = template.mediaId;
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
      $scope.save = function (name, price, mediaId) {
        $scope.loading = true;
        TemplateService.updateTemplate($routeParams.id, name, price, mediaId, function (err, templateId) {
          if (!err) {
            $scope.loading = false;
            $location.path('templates');
          }
        });
      }
    }]);

});