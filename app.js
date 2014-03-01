
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var follow = require('./routes/follow');
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



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
