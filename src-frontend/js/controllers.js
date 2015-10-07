/**
 * Created by igbopie on 11/16/14.
 */

var angular = require('angular');

/* Controllers */
module.exports = angular.module('huh.controllers', []);

// All controllers here
require('./controllers/indexController');
require('./controllers/questionDetailController');
require('./controllers/pageController');
require('./controllers/starbucks/indexController');
require('./controllers/starbucks/loginController');
require('./controllers/starbucks/toolbarController');
require('./controllers/starbucks/dashboardController');
require('./controllers/starbucks/pagesController');
require('./controllers/starbucks/pageController');
require('./controllers/starbucks/flagsController');
require('./controllers/starbucks/registrationsController');
require('./controllers/starbucks/questionsController');
require('./controllers/starbucks/questionController');
require('./controllers/starbucks/commentController');
require('./controllers/starbucks/questionCreateController');
