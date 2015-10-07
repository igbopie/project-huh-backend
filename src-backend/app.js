/**
 * APP ENV VARS
 *
 * AWS (Required)
 * --------
 * AWS_ACCESS_KEY_ID
 * AWS_SECRET_ACCESS_KEY
 * AWS_SESSION_TOKEN (optional?)
 * AWS_S3_BUCKET
 *
 * TWILIO (Optional)
 * ----------
 * TWILIO_ACCOUNT_SID
 * TWILIO_TOKEN
 * TWILIO_FROM
 *
 * MONGO (Required)
 * ----------
 * MONGOLAB_URI || MONGOHQ_URL (HEROKU CONFIG)
 *
 */
'use strict';

require('newrelic');

global.__base = __dirname + '/';
var __base = global.__base;

console.log('STARTING UP CHECKING ENV...');
if (process.env.MONGOLAB_URI) {
    console.log('Using MONGO LAB');
} else if (process.env.MONGOHQ_URL) {
    console.log('Using MONGO HQ');
} else {
    console.log('Using localhost MONGO');
}
/*if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY && !process.env.AWS_S3_BUCKET) {
 console.log('Please configure correctly S3: AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_S3_BUCKET');
 process.exit(-1);
 }

 if (!process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_TOKEN && !process.env.TWILIO_FROM) {
 console.log('WARNING: Twilio not configured: using log for SMS');
 }*/

if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY && !process.env.AWS_S3_BUCKET) {
    console.log('WARNING: Please configure correctly S3: AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_S3_BUCKET');
}

if (!process.env.BITLY_USERNAME &&
    !process.env.BITLY_TOKEN &&
    !process.env.BITLY_DOMAIN &&
    !process.env.BITLY_DOMAIN_REDIRECT) {
    console.log('WARNING: Bitly not configured');
}

console.log('STARTING UP ENV CHECKED.');
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();

// ROUTES
var index = require(__base + 'routes/index');
var user = require(__base + 'routes/user');
var question = require(__base + 'routes/question');
var questionType = require(__base + 'routes/questionType');
var comment = require(__base + 'routes/comment');
var vote = require(__base + 'routes/vote');
var flag = require(__base + 'routes/flag');
var notification = require(__base + 'routes/notification');
var setting = require(__base + 'routes/setting');
var starbucks = require(__base + 'routes/starbucks');
var registration = require(__base + 'routes/registration');


var page = require(__base + 'routes/page');
var Apn = require(__base + 'utils/apn');
var UserService = require(__base + 'models/user').Service;


mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/huh');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

// route middleware to auth
app.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        UserService.isAuth(token, function (err, authUser) {
            if (!err) {

                // if everything is good, save to request for use in other routes
                req.authUser = authUser;
                next();
            }
        });
    } else {
        next();
    }
});


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/q/:questionId', index.question);

// USER
app.post('/api/user/login', user.login);
app.post('/api/user/login/check', user.loginCheck);
app.post('/api/user/create', user.create);
app.post('/api/user/addapntoken', user.addApnToken);
app.post('/api/user/removeapntoken', user.removeApnToken);
app.post('/api/user/addgcmtoken', user.addGcmToken);
app.post('/api/user/removegcmtoken', user.removeGcmToken);
app.post('/api/user/location', user.updateLocation);

app.post('/api/question/create', question.create);
app.post('/api/question/view', question.view);
app.post('/api/question/delete', question.delete);
app.post('/api/question/list', question.recent);
app.post('/api/question/recent', question.recent);
app.post('/api/question/trending', question.trending);
app.post('/api/question/mine', question.mine);
app.post('/api/question/favorites', question.favorites);
app.post('/api/question/commented', question.commented);
app.post('/api/question/flag', flag.flagQuestion);
app.post('/api/question/near', question.near);

app.get('/api/questiontype/list', questionType.list);
app.post('/api/questiontype/list', questionType.list);

app.post('/api/comment/create', comment.create);
app.post('/api/comment/list', comment.list);
app.post('/api/comment/view', comment.view);
app.post('/api/comment/flag', flag.flagComment);

app.post('/api/vote/up', vote.up);
app.post('/api/vote/down', vote.down);
app.post('/api/vote/clear', vote.clear);

app.post('/api/notification/list', notification.list);
app.post('/api/notification/markallasread', notification.markAllAsRead);

app.post('/api/setting/list', setting.list);
app.post('/api/setting/update', setting.update);
app.post('/api/starbucks/dashboard', starbucks.dashboard);

app.post('/api/page/list', page.list);
app.post('/api/page/view', page.view);
app.get('/api/page/view/:url', page.view);
app.post('/api/page/create', page.create);
app.post('/api/page/update', page.update);

app.post('/api/flag/list', flag.list);

app.post('/api/registration/create', registration.create);
app.post('/api/registration/list', registration.list);



var server = http.createServer(app);
var listen;
exports.start = function (callback) {
    listen = server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
        if (callback) {
            callback();
        }
    });
};

exports.stop = function () {
    listen.close();
    Apn.close();
};
