/**
 * Created by igbopie on 11/16/14.
 */
var angular = require('angular');

module.exports = angular.module('huh.services', []);

// All services here
require('./services/questionService');
require('./services/commentService');
require('./services/authService');
require('./services/starbucksService');
require('./services/pageService');
