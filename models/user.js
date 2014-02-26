var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	bcrypt = require('bcrypt')
  , crypto = require('crypto')
  ,	dateUtils = require('date-utils')
  ,	SALT_WORK_FACTOR = 4
  , TOKEN_LENGTH = 48
  , MAX_TOKENS = 10;



var tokenSchema = new Schema({
    token		: {	type: String, required: true, index: { unique: true } }
  , created		: { type: Date	, required: true, default: Date.now }
  , expiration  : { type: Date	, required: true}
  , lastUsed	: { type: Date 	, required: false }
});

var userSchema = new Schema({
    username	: { type: String, required: true, trim: true, index: { unique: true } }
  ,	password	: { type: String, required: true }
  , email   	: { type: String, required: true, index: { unique: true }  }
  , created		: { type: Date	, required: true, default: Date.now }
  , modified	: { type: Date	, required: true, default: Date.now }
  , tokens		: [tokenSchema]
  //TODO photo, iOS Device ID,Android Device ID,Facebook ID
});



userSchema.pre('save', function(next) {
    var user = this;
 
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
	        hours: 1,
	        days: 0,
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
 
 
 
var user = mongoose.model('user', userSchema);

module.exports = {
  User: user
};