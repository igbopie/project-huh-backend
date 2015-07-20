/**
 * Created by igbopie on 11/16/14.
 */
var angular = require('angular');

module.exports = angular.module('huh.services', []);

// All services here
var questionService = require('./services/questionService');
var commentService = require('./services/commentService');
var authService = require('./services/authService');
var starbucksService = require('./services/starbucksService');
