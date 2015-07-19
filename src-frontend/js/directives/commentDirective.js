"use strict";
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require("angular");
var directives = require("../directives");

directives
    .directive('huhComment', function () {
        return {
            restrict: 'E',
            scope: {
                comment: '=comment'
            },
            templateUrl: 'partials/directives/comment.html'
        };
    }
);
