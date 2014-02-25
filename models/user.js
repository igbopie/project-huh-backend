var mongoose = require('mongoose')
  , Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 12;


function defaultTokenDate(){
	var date = new Date();
	date.setYear(date.getYear()+1);
	return date;
}

var tokenSchema = new Schema({
    token		: {	type: String, required: true, index: { unique: true } }
  , created		: { type: Date	, required: true, default: Date.now }
  , expiration  : { type: Date	, required: true, default: defaultTokenDate }
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
 
 
var user = mongoose.model('user', userSchema);

module.exports = {
  User: user
};