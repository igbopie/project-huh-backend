/**
 * Created by igbopie on 11/16/14.
 */

var angular = require("angular");
var controllers = require("../controllers");
var services = require("../services");

controllers
  .controller('IndexCtrl',
    function ($scope, $http, $location, QuestionService) {

      $scope.questions = [];
      QuestionService.recent(function (err, list) {
        $scope.questions = list;
      });

      $scope.goToQuestion = function (question) {
        $location.path("/q/" + question._id);
      }

    })

  .controller('QuestionDetailCtrl',
    function ($scope, $http, $location, $routeParams, QuestionService, CommentService) {

      $scope.question = {};
      QuestionService.view($routeParams.questionId, function (err, question) {
        $scope.question = question;
      });

      CommentService.list($routeParams.questionId, function (err, comments) {
        $scope.comments = comments;
      });

      /*$scope.goToQuestion = function(question) {
       $location.path("/q/" + question._id);
       }*/

    })
;
