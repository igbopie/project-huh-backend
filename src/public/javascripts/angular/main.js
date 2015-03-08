/**
 * Created by igbopie on 11/16/14.
 */

'use strict';

require.config({
  paths: {
    moment: '/libs/moment/moment',
    angular: '/libs/angular/angular.min',
    angularRoute: '/libs/angular-route/angular-route.min',
    angularCookies: '/libs/angular-cookies/angular-cookies.min',
    angularAria: '/libs/angular-aria/angular-aria.min',
    angularAnimate: '/libs/angular-animate/angular-animate.min',
    angularMaterial: '/libs/angular-material/angular-material.min',
    angularMoment: '/libs/angular-moment/angular-moment'
  },
  shim: {
    'moment': {
      deps: [],
      'exports': 'moment'
    },
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

    'angularAria': {
      deps: ['angular'],
      'exports': 'angular.aria'
    },

    'angularAnimate': {
      deps: ['angular'],
      'exports': 'angular.animate'
    },

    'angularMaterial': {
      deps: ['angular'],
      'exports': 'angular.material'
    },
    'angularMoment': {
      deps: ['angular', 'moment'],
      'exports': 'angular.moment'
    }
  },
  priority: [
    "angular"
  ]
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = "NG_DEFER_BOOTSTRAP!";

// AngularMoment needs to be loaded this way...
require([
  'angular',
  'angularMoment',
  'app',
  'routes'
], function (angular,angularMoment, app, routes) {
  require(['angular-moment'], function(){
    var $html = angular.element(document.getElementsByTagName('html')[0]);
    angular.element().ready(function () {
      angular.resumeBootstrap([app['name']]);
    });
  });

});