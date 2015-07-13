/**
 * Created by igbopie on 11/16/14.
 */

var angular = require("angular");
var controllers = require("../controllers");
var services = require("../services");
var questionService = require("../services/questionService");
var commentService = require("../services/commentService");

controllers
  .controller('IndexCtrl', ['$scope', '$http', "$location", "QuestionService",
    function ($scope, $http, $location, QuestionService) {

      $scope.questions = [];
      QuestionService.recent(function (err, list) {
        console.log(list);
        $scope.questions = list;
      });

      $scope.goToQuestion = function (question) {
        $location.path("/q/" + question._id);
      }

    }])

  .controller('QuestionDetailCtrl', ['$scope', '$http', "$location", "$routeParams", "QuestionService", "CommentService",
    function ($scope, $http, $location, $routeParams, QuestionService, CommentService) {

      $scope.question = {};
      QuestionService.view($routeParams.questionId, function (err, question) {
        console.log(question);
        $scope.question = question;

      });

      CommentService.list($routeParams.questionId, function (err, comments) {
        console.log(comments);
        $scope.comments = comments;

      });

      /*$scope.goToQuestion = function(question) {
       $location.path("/q/" + question._id);
       }*/

    }])
;
