/**
 * Created by igbopie on 11/16/14.
 */
'use strict';

var angular = require('angular');
var services = require('./services');

module.exports = angular.module('huh.directives', ['huh.services']);

// All directives here
require('./directives/questionDirective');
require('./directives/commentDirective');
require('./directives/rightClick');
