var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	bcrypt = require('bcrypt')
  , crypto = require('crypto')
  ,	dateUtils = require('date-utils')
  , Utils = require('../utils/utils')
  ,	SALT_WORK_FACTOR = 4
  , TOKEN_LENGTH = 48
  , MAX_TOKENS = 10
  , SMS_VERIFICATION_LENGTH = 6
  , MAX_PHONE_VERIFICATION_TRIES = 3
  , TOKEN_EXPIRATION_DAYS = 30
  , TOKEN_EXPIRATION_HOURS = 0
  , textSearch = require('mongoose-text-search')
  , PUBLIC_USER_FIELDS ="username mediaId bio name"
  , FRIENDS_LIMIT = 1000;

/*var friendRequestSchema = new Schema({
    friendId		: {	type: Schema.Types.ObjectId, required: true}
  , friendUsername	: { type: String	, required: true}
  , dateRequested  		: { type: Date	, required: true, default: Date.now}
});

var friendSchema = new Schema({
    friendId		: {	type: Schema.Types.ObjectId, required: true}
  , friendUsername	: { type: String	, required: true}
  , displayName		: { type: String	, required: false}
  , dateAdded  		: { type: Date	, required: true, default: Date.now}
  , dateRequested  		: { type: Date	, required: true}
});
*/


var tokenSchema = new Schema({
    token		: {	type: String, required: true}
  , created		: { type: Date	, required: true, default: Date.now }
  , expiration  : { type: Date	, required: true}
  , lastUsed	: { type: Date 	, required: false }
});


var userSchema = new Schema({
    username	    : { type: String, required: true, trim: true, index: { unique: true } }
  ,	password	    : { type: String, required: true }
  , email   	    : { type: String, required: true, index: { unique: true }  }
  , name           : { type: String, required: false}
  , bio           : { type: String, required: false}
  , created		    : { type: Date	, required: true, default: Date.now }
  , modified	    : { type: Date	, required: true, default: Date.now }
  , phone			: {	type: String  , required: false, index: { unique: true, sparse: true } } // HASHED
  , phoneVerificationCode: { type: String  , required: false }
  , phoneVerificationTries: { type: Number	  , required: false }
  , phoneVerified		: { type: Boolean , required: true, default: false }
  , phoneDateVerified	: { type: Date	  , required: false }
  , phoneDateAdded		: { type: Date	  , required: false }
  , tokens		    : [tokenSchema]
  , mediaId	: {	type: Schema.Types.ObjectId, required: false}
  , facebookId      : { type: String, required: false, index: { unique: true, sparse: true } }
  , apnToken        : { type: String  , required: false } //iOs notification
  , apnSubscribeDate: { type: Date	  , required: false }
  , gcmToken        : { type: String  , required: false } //Android notification
  , gcmSubscribeDate: { type: Date	  , required: false }

    //TODO photo, iOS Device ID,Android Device ID,Facebook ID
});


userSchema.plugin(textSearch);
userSchema.index({username: 'text',name:'text'});


userSchema.pre('save', function(next) {
    var user = this;

    user.username = user.username.toLowerCase();
    user.email = user.email.toLowerCase();

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();
	 
	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);
	 
	    // hash the password using our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);
	 
	        // override the cleartext password with the hashed one
	        user.password = hash;
	        next();
	    });
	});
 
});


userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


userSchema.methods.createToken = function(cb) {
	var me = this;
	var expiration = new Date();
	expiration.add({ 	milliseconds: 0,
	        seconds: 0,
			minutes: 0,
	        hours: TOKEN_EXPIRATION_HOURS,
	        days: TOKEN_EXPIRATION_DAYS,
	        weeks: 0,
	        months: 0,
	        years: 0});
	
	crypto.randomBytes(TOKEN_LENGTH,
		function(err, buf) {
			if (err){
				cb(err);
			}else{
				//Remove other tokens
				while(me.tokens.length >= MAX_TOKENS){
					me.tokens.shift();	
				}
			
				var token = buf.toString('hex');
				me.tokens.push({token:token,expiration:expiration});
				me.save(function(err) {
					if(err) {
						cb(err);  
					} else {
						cb(null,token); 
					}
				});
			}
		});
};
 

userSchema.methods.addPhone = function(phone,cb) {
	var me = this;
	var parsedPhone = phone.replace(/[^0-9]/g, ""); 
	me.phone = phone;
	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return cb(err);
	 
	    // hash the password using our new salt
	    bcrypt.hash(parsedPhone, salt, function(err, hash) {
	        if (err) return cb(err);
	 
	        // override the cleartext password with the hashed one
	        me.phone = hash;
	        me.phoneDateAdded = Date.now();
	        me.phoneVerified = false;
			me.phoneVerificationCode = Utils.randomNumber(SMS_VERIFICATION_LENGTH);
			me.phoneVerificationTries = 0;
			
			me.save(function(err){
				if(err){
					cb(err);
				} else {
					cb(null,me.phoneVerificationCode);
				}
			});
	    });
	});
};


userSchema.methods.verifyPhone = function(phone,verificationCode,cb) {
	var me = this;
	var parsedPhone = phone.replace(/[^0-9]/g, ""); 
	
	bcrypt.compare(parsedPhone, me.phone, function(err, isMatch) {
		if (err) return cb(err);
		
		if(isMatch && verificationCode == me.phoneVerificationCode && me.phoneVerificationTries < MAX_PHONE_VERIFICATION_TRIES){
			me.phoneVerified = true;
			me.phoneDateVerified = Date.now();
			
			me.save(function(err){
		    	if (err) return cb(err);
		    	
		    	cb(null,true);
			});
		} else {
			me.phoneVerificationTries ++;
			
			me.save(function(err){
		    	if (err) return cb(err);
		    	
		    	cb(null,false);
			});  
		}
	});
	        
}

var User = mongoose.model('User', userSchema);

//Service?
var service = {};

service.findUserProfile = function(username,fields,callback){
    User.findOne({ username: { $regex: new RegExp(username, "i") } },fields, function(err, doc) {
        if(err) {
            callback(err);
        } else {
            callback(err,doc);
        }
    });
}

service.extendToken= function(token,callback){
    service.findUserByToken(token,function(err,user){
        if(err) return callback(err);
        if(!user) return callback("Timedout");


        var expiration = new Date();
        expiration.add({ 	milliseconds: 0,
            seconds: 0,
            minutes: 0,
            hours: TOKEN_EXPIRATION_HOURS,
            days: TOKEN_EXPIRATION_DAYS,
            weeks: 0,
            months: 0,
            years: 0});

        for(var i = 0;i<user.tokens.length;i++){
            var tokenObj = user.tokens[i];
            if(tokenObj.token == token){
                tokenObj.expiration = expiration;
                break;
            }
        }
        user.save(callback);

    });
}
service.findUserByToken = function(token,callback){
    User.findOne({"tokens.token":token},function(err,user){
			if(err) {
				callback(user);
			} else if (user == null){
				callback(null,null);
			}else{
				var completeToken = null;
				//look for the token
				for(var i = 0; i < user.tokens.length; i++){
					if(user.tokens[i].token == token){
						completeToken = user.tokens[i];
						break; 
					}
				}	
				if(completeToken == null){
					callback(null,null);
				}else{
					//verify the expiration date
					if(new Date().isBefore(completeToken.expiration)){
						callback(null,user);
						//return the user
					} else {
						//I think I should delete this token
						callback(null,null);
					}
				}
			}
	});
};
service.findUserByUsername = function(username,callback){
	// Using RegEx - search is case insensitive
    User.findOne({ username: username.toLowerCase() }, function(err, doc) {
		if(err) { 
			callback(err);
		} else {
			callback(err,doc);
		}

	});

};

service.findUserByEmail = function(email,callback){
    // Using RegEx - search is case insensitive
    User.findOne({ email: email.toLowerCase() }, function(err, doc) {
        if(err) {
            callback(err);
        } else {
            callback(err,doc);
        }

    });

};

service.findUserById = function(id,callback){
	// Using RegEx - search is case insensitive
    User.findOne({ _id: id }, function(err, doc) {
		if(err) { 
			callback(err);
		} else {
			callback(err,doc);
		}
	});
};

service.search = function(text,callback){
    /*var options = {
        project: {_id:1,username:1,followers:1,following:1}           // do not include the `created` property
        //, filter: { likes: { $gt: 1000000 }} // casts queries based on schema
        ,limit: 20
        , language: 'english'
        , lean: true
    }

    user.textSearch(text, options,  function (err, output) {
        if (err) return callback(err);

        console.log(output);

        callback(null,output.results);

    });*/

    User.find({"username": { $regex: new RegExp(text, "i") }},{_id:1,username:1} ).limit(20).exec(function(err,docs){
        callback(err,docs);
    });
}


module.exports = {
  User: User,
  Service:service,
  PUBLIC_USER_FIELDS:PUBLIC_USER_FIELDS
};