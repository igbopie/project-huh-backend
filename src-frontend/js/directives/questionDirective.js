/**
 * Created by igbopie on 11/16/14.
 */

var angular = require("angular");
var directives = require("../directives");

directives
  .directive('huhQuestion', function() {
    return {
      restrict: 'E',
      scope: {
        question: '=question'
      },
      templateUrl: 'partials/directives/question.html'
    }
  }
);
