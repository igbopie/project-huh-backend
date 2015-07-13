var angular = require("angular");
var angularMoment = require("angular-moment");
var angularRoute = require("angular-route");
var angularCookies = require("angular-cookies");
var angularAria = require("angular-aria");
var angularAnimate = require("angular-animate");
var angularMaterial = require("angular-material");
var services = require("./services");
var directives = require("./directives");
var controllers = require("./controllers");

var huh = angular.module('huh', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'ngAria',
  'ngMaterial',
  'angularMoment',
  'huh.services',
  'huh.directives',
  'huh.controllers'
]);

huh.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default').primaryPalette('amber');
});

module.exports = huh;

var routes = require("./routes");