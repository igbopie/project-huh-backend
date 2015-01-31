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
if (process.env.MONGOLAB_URI) {
  console.log("Using MONGO LAB")
} else if (process.env.MONGOHQ_URL) {
  console.log("Using MONGO HQ")
} else {
  console.log("Using localhost MONGO");
}
/*if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SECRET_ACCESS_KEY && !process.env.AWS_S3_BUCKET) {
  console.log("Please configure correctly S3: AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_S3_BUCKET");
  process.exit(-1);
}

if (!process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_TOKEN && !process.env.TWILIO_FROM) {
  console.log("WARNING: Twilio not configured: using log for SMS");
}*/

console.log("STARTING UP ENV CHECKED.")
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./server/routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();

//ROUTES
var index = require('./server/routes/index');
var user = require('./server/routes/user');
var question = require('./server/routes/question');
var questionType = require('./server/routes/questionType');
var comment = require('./server/routes/comment');

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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', index.index);

//USER
app.post('/api/user/create', user.create);
app.post('/api/user/addapntoken', user.addApnToken);
app.post('/api/user/removeapntoken', user.removeApnToken);
app.post('/api/user/addgcmtoken', user.addGcmToken);
app.post('/api/user/removegcmtoken', user.removeGcmToken);

app.post('/api/question/create', question.create);
app.post('/api/question/list', question.list);


app.get('/api/questiontype/list', questionType.list);
app.post('/api/questiontype/list', questionType.list);

app.post('/api/comment/create', comment.create);
app.post('/api/comment/list', comment.list);



http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
