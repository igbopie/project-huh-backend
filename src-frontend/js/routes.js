/**
 * Created by igbopie on 11/16/14.
 */

'use strict';

var angular = require('angular');
var app = require('./app');

app.config(function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');
    //
    // Now set up the states
    $stateProvider
        .state(
            'root',
            {
                url: '/',
                templateUrl: 'partials/index.html',
                controller: 'IndexCtrl'
            })
        .state(
            'question',
            {
                url: '/q/:questionId',
                templateUrl: 'partials/questiondetail.html',
                controller: 'QuestionDetailCtrl'
            })
        .state(
            'starbuckslogin',
            {
                url: '/starbucks/login',
                templateUrl: 'partials/starbucks.login.html',
                controller: 'StarbucksLoginCtrl'
            })
        .state(
            'starbucks',
            {
                url: '/starbucks',
                templateUrl: 'partials/starbucks.html',
                controller: 'StarbucksIndexCtrl'
            })

        .state(
            'starbucks.dashboard',
            {
                url: '/dashboard',
                views: {
                    'toolbar': {
                        templateUrl: 'partials/starbucks.toolbar.html',
                        controller: 'StarbucksToolbarCtrl'
                    },
                    'main': {
                        controller: 'StarbucksDashboardCtrl',
                        templateUrl: 'partials/starbucks.dashboard.html'
                    }
                }
            });
});
