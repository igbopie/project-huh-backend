/**
 * Created by igbopie on 11/16/14.
 */
'use strict';

define(['../libs/angular/angular.min'], function (angular, services) {

  /* Directives */

  angular.module('markStarbucks.directives', ['markStarbucks.services'])

    .directive('ngConfirmClick', [
      function () {
        return {
          link: function (scope, element, attr) {
            var msg = attr.ngConfirmClick || "Are you sure?";
            var clickAction = attr.ngConfirmedClick;
            element.bind('click', function (event) {
              if (window.confirm(msg)) {
                scope.$eval(clickAction)
              }
            });
          }
        };
      }])

    .directive('ng-image', [
      function () {
        return {
          link: function (scope, element, attr) {
            var msg = attr.ngConfirmClick || "Are you sure?";
            var clickAction = attr.ngConfirmedClick;

          }
        };
      }
    ])

    .directive('loadMediaId', ['MediaService', '$timeout', function (MediaService, $timeout) {

      var link = function (scope, element, attrs) {

        scope.$watch(attrs.loadMediaId, function (newValue) {
          $(element).after("<i id='" + newValue + "-loader' class='fa fa-spin fa-refresh'></i>");
          $timeout(function () {
            console.log("loadMediaId:" + newValue + " ");

            MediaService.getMedia(newValue, "thumb", function (image) {
              element.attr("src", image);
              $("#" + newValue + "-loader").remove();
            });
          }, 100);

          //load Image
          // Set visibility: false + inject temporary spinner overlay
          //element.addClass('spinner-hide');
          // element.parent().append('<span class="spinner"></span>');
        });
      }


      return {
        link: link
      };
    }]);
});