var dateUtils = require('date-utils');
var iso8601 = require('iso8601');

/*
 * GET home page.
 */

exports.index = function (req, res) {
  res.render('index', {title: 'Express'});
};

