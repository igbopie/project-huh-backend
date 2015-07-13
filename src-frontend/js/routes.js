/**
 * Created by igbopie on 11/16/14.
 */

'use strict';

var angular = require("angular");
var app = require("./app");

app.config( function ($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    }).
    when('/q/:questionId', {
      templateUrl: 'partials/questiondetail.html',
      controller: 'QuestionDetailCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
});