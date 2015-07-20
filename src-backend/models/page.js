'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var pageSchema = new Schema({
    url: {type: String, required: true, index: {unique: true}},
    created: {type: Date, required: true, default: Date.now},
    modified: {type: Date, required: true, default: Date.now},
    html: {type: String, required: true}
});

var Page = mongoose.model('Page', pageSchema);

// Service
var PageService = {};

PageService.create = function (url, html, callback) {
    var page = new Page();
    page.url = url;
    page.html = html;
    page.save(function (err) {
        callback(err, page._id);
    });
};

PageService.update = function (id, url, html, callback) {
    Page.findOne({_id: id}, function (err, page) {
        if (err) {
            return callback(err);
        }

        if (!page) {
            return callback('not found');
        }

        page.url = url;
        page.html = html;
        page.save(function (err) {
            callback(err, page._id);
        });
    });
};

PageService.view = function (url, callback) {
    Page.findOne({url: url}, function (err, page) {

        if (err) {
            return callback(err);
        }

        if (!page) {
            return callback();
        }
        callback(err, page);
    });
};

PageService.list = function (callback) {
    Page.find({}, 'url created modified', callback);
};


module.exports = {
    Service: PageService
};
