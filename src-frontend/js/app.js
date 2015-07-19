'use strict';
var angular = require('angular');
var angularUIRouter = require('angular-ui-router');
var angularMoment = require('angular-moment');
var angularCookies = require('angular-cookies');
var angularAria = require('angular-aria');
var angularAnimate = require('angular-animate');
var angularMaterial = require('angular-material');
var icons = require('angular-material-icons');
var services = require('./services');
var directives = require('./directives');
var controllers = require('./controllers');

var huh = angular.module('huh', [
    'ui.router',
    'ngCookies',
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'angularMoment',
    'ngMdIcons',
    'huh.services',
    'huh.directives',
    'huh.controllers'
]);

huh.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default').primaryPalette('deep-purple');
});

module.exports = huh;

var routes = require('./routes');
