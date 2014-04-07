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
console.log("STARTING UP CHECKING ENV...")
if(process.env.MONGOLAB_URI){
    console.log("Using MONGO LAB")
} else if(process.env.MONGOHQ_URL){
    console.log("Using MONGO HQ")
} else {
    console.log("Using localhost MONGO");
}
if(!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY && !process.env.AWS_S3_BUCKET){
    console.log("Please configure correctly S3: AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_S3_BUCKET");
    process.exit(-1);
}

if(!process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_TOKEN && !process.env.TWILIO_FROM){
    console.log("WARNING: Twilio not configured: using log for SMS");
}

console.log("STARTING UP ENV CHECKED.")
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();

//ROUTES

var user = require('./routes/user');
var follow = require('./routes/follow');
var media = require('./routes/media');
var seem = require('./routes/seem');

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
app.get('/upload', routes.imageupload);

//USER
app.post('/api/user/create', user.create);
app.post('/api/user/login', user.login);
app.post('/api/user/extendtoken', user.extendToken);
app.post('/api/user/profile', user.profile);
app.post('/api/user/update', user.update);
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
app.post('/api/media/get/:format/:id', media.get);
app.get('/api/media/get/:format/:id', media.get);

//SEEM
//@Deprecated use without m1
app.post('/api/m1/seem', seem.list);
app.post('/api/m1/seem/create', seem.create);
app.post('/api/m1/seem/item/get', seem.getItem);
app.post('/api/m1/seem/item/replies', seem.getItemReplies);
app.post('/api/m1/seem/item/reply', seem.reply);
//

app.post('/api/seem', seem.list);
app.post('/api/seem/create', seem.create);
app.post('/api/seem/item/get', seem.getItem);
app.post('/api/seem/item/replies', seem.getItemReplies);
app.post('/api/seem/item/reply', seem.reply);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
