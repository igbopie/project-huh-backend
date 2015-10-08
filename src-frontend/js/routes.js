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
            'page',
            {
                url: '/p/:url',
                templateUrl: 'partials/page.html',
                controller: 'PageCtrl'
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
            })

        .state(
            'starbucks.pages',
            {
                url: '/pages',
                views: {
                    'toolbar': {
                        templateUrl: 'partials/starbucks.toolbar.html',
                        controller: 'StarbucksToolbarCtrl'
                    },
                    'main': {
                        controller: 'StarbucksPagesCtrl',
                        templateUrl: 'partials/starbucks.pages.html'
                    }
                }
            })
        .state(
            'starbucks.page',
            {
                url: '/pages/:url',
                views: {
                    'toolbar': {
                        templateUrl: 'partials/starbucks.toolbar.html',
                        controller: 'StarbucksToolbarCtrl'
                    },
                    'main': {
                        controller: 'StarbucksPageCtrl',
                        templateUrl: 'partials/starbucks.page.html'
                    }
                }
            })
        .state(
            'starbucks.flags',
            {
                url: '/flags',
                views: {
                    'toolbar': {
                        templateUrl: 'partials/starbucks.toolbar.html',
                        controller: 'StarbucksToolbarCtrl'
                    },
                    'main': {
                        controller: 'StarbucksFlagsCtrl',
                        templateUrl: 'partials/starbucks.flags.html'
                    }
                }
            })
        .state(
            'starbucks.registrations',
            {
                url: '/registrations',
                views: {
                    'toolbar': {
                        templateUrl: 'partials/starbucks.toolbar.html',
                        controller: 'StarbucksToolbarCtrl'
                    },
                    'main': {
                        controller: 'StarbucksRegistrationsCtrl',
                        templateUrl: 'partials/starbucks.registrations.html'
                    }
                }
            })
        .state(
            'starbucks.questions',
            {
                url: '/questions',
                views: {
                    'toolbar': {
                        templateUrl: 'partials/starbucks.toolbar.html',
                        controller: 'StarbucksToolbarCtrl'
                    },
                    'main': {
                        controller: 'StarbucksQuestionsCtrl',
                        templateUrl: 'partials/starbucks.questions.html'
                    }
                }
            })
        .state(
        'starbucks.question',
        {
            url: '/questions/:questionId',
            views: {
                'toolbar': {
                    templateUrl: 'partials/starbucks.toolbar.html',
                    controller: 'StarbucksToolbarCtrl'
                },
                'main': {
                    controller: 'StarbucksQuestionCtrl',
                    templateUrl: 'partials/starbucks.question.html'
                }
            }
        })
        .state(
        'starbucks.comment',
        {
            url: '/comment/:commentId',
            views: {
                'toolbar': {
                    templateUrl: 'partials/starbucks.toolbar.html',
                    controller: 'StarbucksToolbarCtrl'
                },
                'main': {
                    controller: 'StarbucksCommentCtrl',
                    templateUrl: 'partials/starbucks.comment.html'
                }
            }
        })
        .state(
        'starbucks.commentSelected',
        {
            url: '/comment/:commentId/selected/:selected',
            views: {
                'toolbar': {
                    templateUrl: 'partials/starbucks.toolbar.html',
                    controller: 'StarbucksToolbarCtrl'
                },
                'main': {
                    controller: 'StarbucksCommentCtrl',
                    templateUrl: 'partials/starbucks.comment.html'
                }
            }
        })
        .state(
        'starbucks.questionCreate',
        {
            url: '/question/create',
            views: {
                'toolbar': {
                    templateUrl: 'partials/starbucks.toolbar.html',
                    controller: 'StarbucksToolbarCtrl'
                },
                'main': {
                    controller: 'StarbucksQuestionCreateCtrl',
                    templateUrl: 'partials/starbucks.questionCreate.html'
                }
            }
        })

    ;
});
