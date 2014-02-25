
var User = require('../models/user').User; 
var crypto = require('crypto');

/*
 * GET users listing.
 */

exports.list = function(req, res){
  User.find({}, function(err, docs) {
    if(!err) {
      res.json(200, { users: docs });  
    } else {
      res.json(500, { message: err });
    }
  });
};

exports.create = function(req, res) {
	//req.query. for GET
  var email = req.body.email; // Name of workout. 
  var username = req.body.username;  // Description of the workout
  var password = req.body.password;  

  //Workout.findOne({ name: workout_name }, function(err, doc) {  // This line is case sensitive.
  User.findOne({ username: { $regex: new RegExp(username, "i") } }, function(err, doc) {  // Using RegEx - search is case insensitive
    if(!err && !doc) {
      
      var newUser = new User(); 

      newUser.email = email; 
      newUser.username = username; 
      newUser.password = password;
      
      newUser.save(function(err) {

        if(!err) {
          res.json(201, {message: "User created with username: " + newUser.username });    
        } else {
          res.json(500, {message: "Could not create user. Error: " + err});
        }

      });

    } else if(!err) {
      
      // User is trying to create a workout with a name that already exists. 
      res.json(403, {message: "User with that username already exists, please update instead of create or create a new workout with a different name."}); 

    } else {
      res.json(500, { message: err});
    } 
  });

}


exports.login = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;  
	User.findOne({ username: { $regex: new RegExp(username, "i") } }, function(err, doc) {  // Using RegEx - search is case insensitive
		if(!err && !doc) {
			// User is trying to create a workout with a name that already exists. 
			res.json(403, {message: "Invalid user or password"}); 

		} else if(!err) {
			doc.comparePassword(password, function(err, isMatch) {
	        	if (err){
						res.json(500, { message: err});
	        	}else{
	        		if(isMatch){
		        		crypto.randomBytes(48, function(err, buf) {
		        			if (err){
								res.json(500, { message: err});
							}else{
								var token = buf.toString('hex');
								doc.tokens.push({token:token});
								doc.save(function(err) {
							        if(err) {
							          res.json(500, { message: err});  
							        } else {
							          res.json(200, {token:token,message: "OK, now I should return token"}); 
							        }
							    });
							}
						});

					} else {
		        		res.json(403, {message: "Invalid user or password"}); 
		        	}
		        }
		    });

		} else {
			res.json(500, { message: err});
		} 
  });

}
