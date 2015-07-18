'use strict';
var dateUtils = require('date-utils');
var iso8601 = require('iso8601');

/*
 * GET home page.
 */

/*jslint unparam: true*/
exports.index = function (req, res) {
    res.render('index', {title: 'Express'});
};
/*jslint unparam: false*/

exports.question = function (req, res) {
    res.redirect('#/q/' + req.params.questionId);
};


