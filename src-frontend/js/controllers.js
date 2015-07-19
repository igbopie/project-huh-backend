/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');

/* Controllers */
module.exports = angular.module('huh.controllers', []);

// All controllers here
var indexController = require('./controllers/indexController');
var questionDetailController = require('./controllers/questionDetailController');
var starbucksIndexController = require('./controllers/starbucksIndexController');
var starbucksLoginController = require('./controllers/starbucksLoginController');
var starbucksToolbarController = require('./controllers/starbucksToolbarController');
