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
var mark = require('./routes/mark');
var mapicon = require('./routes/mapicon');

mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/seem');

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

app.get('/', routes.index);
app.get('/i/:itemId', routes.item);
app.get('/m/:markId', routes.mark);


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
//----
app.post('/api/mark/item/create',item.create);
app.post('/api/mark/item/addmedia',item.addMedia);

app.post('/api/mark/view',mark.view);

app.post('/api/mark/favourite',mark.favourite);
app.post('/api/mark/unfavourite',mark.unfavourite);
app.post('/api/mark/favourite/list',mark.listFavourites);

app.post('/api/mark/user/public/list',mark.listUserPublic);

app.post('/api/mark/item',item.listByMark);

app.post('/api/mark/item/view',item.view);

app.post('/api/mark/item/comment',item.listComments);
app.post('/api/mark/item/comment/add',item.addComment);

app.post('/api/mark/item/favourite',item.favourite);
app.post('/api/mark/item/unfavourite',item.unfavourite);
app.post('/api/mark/item/favourite/list',item.listFavourites);

app.post('/api/mark/item/user/public/list',item.listUserPublic);

app.post('/api/mark/search',mark.search);
app.post('/api/mark/item/public',item.public);
app.post('/api/mark/item/find/by/stream',item.public);
app.post('/api/mark/item/private',item.private);
app.post('/api/mark/item/find/by/senttome',item.private);
app.post('/api/mark/item/sent',item.sent);
app.post('/api/mark/item/find/by/sentbyme',item.sent);
//----
app.post('/api/template',template.listTemplates);
app.post('/api/template/update',template.update);
app.post('/api/template/view',template.findById);
app.post('/api/template/create',template.create);
app.post('/api/template/remove',template.removeById);


app.get('/api/mapiconandpack',mapicon.findIconAndIconPacks);
app.post('/api/mapiconandpack',mapicon.findIconAndIconPacks);
app.get('/api/mapicon',mapicon.findIcons);
app.post('/api/mapicon',mapicon.findIcons);
app.post('/api/mapicon/update',mapicon.update);
app.post('/api/mapicon/view',mapicon.findById);
app.post('/api/mapicon/create',mapicon.create);
app.post('/api/mapicon/remove',mapicon.removeById);

app.get('/api/mapicon/pack',mapicon.findIconPacks);
app.post('/api/mapicon/pack',mapicon.findIconPacks);
app.post('/api/mapicon/pack/update',mapicon.updatePack);
app.post('/api/mapicon/pack/view',mapicon.findPackById);
app.post('/api/mapicon/pack/create',mapicon.createPack);
app.post('/api/mapicon/pack/remove',mapicon.removePackById);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
