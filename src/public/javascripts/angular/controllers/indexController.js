/**
 * Created by igbopie on 11/16/14.
 */

define(['angular', 'controllers', 'services/questionService'], function (angular, controllers) {

  /* Controllers */

  return controllers

    .controller('IndexCtrl', ['$scope', '$http', "$location", "QuestionService",
      function ($scope, $http, $location, QuestionService) {

        $scope.questions = [];
        QuestionService.recent(function(err, list) {
          console.log(list);
          $scope.questions = list;
        });
      }]);

});