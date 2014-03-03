/**
 * APP ENV VARS
 *
 * AWS
 * --------
 * AWS_ACCESS_KEY_ID
 * AWS_SECRET_ACCESS_KEY
 * AWS_SESSION_TOKEN (optional?)
 *
 * TWILIO
 * ----------
 * TWILIO_ACCOUNT_SID
 * TWILIO_TOKEN
 * TWILIO_FROM
 *
 * MONGO
 * ----------
 * MONGOLAB_URI || MONGOHQ_URL (HEROKU CONFIG)
 *
 *
 *
 */
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var follow = require('./routes/follow');
var media = require('./routes/media');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/seem');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//USER
app.post('/api/user/create', user.create);
app.post('/api/user/login', user.login);
app.post('/api/user/addphone', user.addPhone);
app.post('/api/user/verifyphone', user.verifyPhone);
//FOLLOW
app.post('/api/followers', follow.followers);
app.post('/api/following', follow.following);
app.post('/api/follow', follow.follow);
app.post('/api/unfollow', follow.unfollow);
//NOTIFICATION
app.post('/api/notification', user.notifications);

//MEDIA
app.post('/api/media/create', media.create);
app.post('/api/media/remove', media.remove);
app.post('/api/media/get', media.get);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
