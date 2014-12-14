/**
 * Created by igbopie on 11/16/14.
 */

'use strict';

require.config({
  paths: {
    angular: '../libs/angular/angular.min',
    angularRoute: '../libs/angular-route/angular-route.min',
    angularCookies: '../libs/angular-cookies/angular-cookies.min',
    angularFileUploadShim: '../libs/danialfarid-angular-file-upload/dist/angular-file-upload-shim.min',
    angularFileUpload: '../libs/danialfarid-angular-file-upload/dist/angular-file-upload.min'
  },
  shim: {
    'angular': {
      'exports': 'angular'
    },

    'angularRoute': {
      deps: ['angular'],
      'exports': 'angular.route'
    },

    'angularCookies': {
      deps: ['angular'],
      'exports': 'angular.cookies'
    },

    'angularFileUploadShim': {
      deps: ['angular'],
      'exports': 'angularFileUploadShim'
    },

    'angularFileUpload': {
      deps: ['angular', 'angularFileUploadShim'],
      'exports': 'angular.fileUpload'

    }
  },
  priority: [
    "angular"
  ]
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

require([
  'angular',
  'app',
  'routes'
], function (angular, app, routes) {
  var $html = angular.element(document.getElementsByTagName('html')[0]);

  angular.element().ready(function () {
    angular.resumeBootstrap([app['name']]);
  });
});