'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var directives = require('../directives');

directives
    .directive('ngRightClick', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    });
