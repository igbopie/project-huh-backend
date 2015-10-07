'use strict';
/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');
var controllers = require('../../controllers');
var services = require('../../services');

controllers
    .controller('StarbucksCommentCtrl',
        /*jshint maxparams:1000 */
        function ($scope,
                  $location,
                  AuthService,
                  CommentService,
                  $stateParams,
                  $mdDialog,
                  $mdToast) {
            $scope.comment = {};
            CommentService.view($stateParams.commentId, function (err, comment) {
                $scope.comment = comment;
            });
        });
