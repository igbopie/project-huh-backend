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
var friend = require('./routes/friend');
var media = require('./routes/media');
var item = require('./routes/item');
var template = require('./routes/template');

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
app.get('/item/:itemId', routes.item);
app.get('/template/preview', routes.template);


//USER
app.post('/api/user/create', user.create);
app.post('/api/user/login', user.login);
app.post('/api/user/extendtoken', user.extendToken);
app.post('/api/user/profile', user.profile);
app.post('/api/user/update', user.update);
app.post('/api/user/addphone', user.addPhone);
app.post('/api/user/verifyphone', user.verifyPhone);

app.post('/api/user/addapntoken', user.addApnToken);
app.post('/api/user/removeapntoken', user.removeApnToken);
app.post('/api/user/addgcmtoken', user.addGcmToken);
app.post('/api/user/removegcmtoken', user.removeGcmToken);

app.post('/api/media/create', media.create);
app.post('/api/media/remove', media.remove);
app.post('/api/media/get/:format/:id', media.get);
app.get('/api/media/get/:format/:id', media.get);

app.post('/api/friends', friend.friends);
app.post('/api/friends/add', friend.addFriend);
app.post('/api/friends/delete', friend.deleteFriend);
app.post('/api/friends/blocked', friend.listBlocked);
app.post('/api/friends/block', friend.block);
app.post('/api/friends/unblock', friend.unblock);
app.post('/api/friends/search', friend.search);

app.post('/api/item/create',item.create);
app.post('/api/item/collect',item.collect);
app.post('/api/item/search/by/location',item.searchByLocation);
app.post('/api/item/leave',item.leave);
app.post('/api/item/view',item.view);
app.post('/api/item/comment/add',item.addComment);
app.post('/api/item/find/by/collected',item.listCollected);
app.post('/api/item/find/by/senttome',item.listSentToMe);
app.post('/api/item/find/by/sentbyme',item.listSentByMe);
app.post('/api/template',template.listTemplates);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
