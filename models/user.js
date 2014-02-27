var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ,	bcrypt = require('bcrypt')
  , crypto = require('crypto')
  ,	dateUtils = require('date-utils')
  ,	SALT_WORK_FACTOR = 4
  , TOKEN_LENGTH = 48
  , MAX_TOKENS = 10
  , MAX_FRIENDS = 5000;

var friendRequestSchema = new Schema({
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
  , phone			: {	type: String  , required: false, index: { unique: true } } // HASHED
  , phoneVerificationCode: { type: String  , required: false }
  , phoneVerified		: { type: Boolean , required: true, default: false }
  , phoneDateVerified	: { type: Date	  , required: false }
  , tokens		: [tokenSchema]
  , friends		: [friendSchema]
  , friendRequests: [friendRequestSchema]
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

//Service?
var service = {};
service.findUserByToken = function(token,callback){
	user.findOne({"tokens.token":token},function(err,user){
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
	user.findOne({ username: { $regex: new RegExp(username, "i") } }, function(err, doc) { 
		if(err) { 
			callback(err);
		} else {
			callback(err,doc);
		}

	});

};



module.exports = {
  User: user,
  Service:service
};