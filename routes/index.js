var dateUtils = require('date-utils');
var iso8601 = require('iso8601');
var ItemService = require('../models/item').Service;
var MarkService = require('../models/mark').Service;

/*
 * GET home page.
 */

exports.index = function (req, res) {
  res.render('index', {title: 'Express'});
};


exports.item = function (req, res) {

  var itemId = req.params.itemId;

  ItemService.findByIdForWeb(itemId, function (err, item) {
    if (err) {
      res.status(500);
      res.render('error', {err: err});
    } else if (!item) {
      res.status(404);
      res.render('404', {});
    } else if (item) {
      res.render('item', {item: item, dateUtils: dateUtils, iso8601: iso8601});
    }
  });
};

exports.mark = function (req, res) {

  var markId = req.params.markId;

  MarkService.findByIdForWeb(markId, function (err, mark) {
    if (err) {
      res.status(500);
      res.render('error', {err: err});
    } else if (!mark) {
      res.status(404);
      res.render('404', {});
    } else if (mark) {
      ItemService.listByMark(mark._id, null, null, null, function (err, items) {
        if (err) {
          res.status(500);
          res.render('error', {err: err});
        } else {
          res.render('mark', {mark: mark, dateUtils: dateUtils, iso8601: iso8601, items: items});
        }
      })
    }
  });
};
