var mongoose = require('mongoose');
var User = require('../apiclient/user');
var Utils = require('../utils/utils');

exports.cleanDatabase = function(callback){
	//Resest DB
    mongoose.connect('mongodb://localhost/seem',function() {
    	mongoose.connection.collection('users').remove( function(err) {
    		mongoose.connection.collection('follows').remove(	function(err) {
               mongoose.disconnect(function(err){
                    if(err) {
                        logger.error(err);
                        return;
                    }
                    callback();
               });

			});
		});
    });
}

exports.findDBUser = function(username,callback){
	mongoose.connect('mongodb://localhost/seem',function() {
    	mongoose.connection.collection('users').findOne({username:username},callback);
    });
}


exports.loginUsers = function(array,test,callback){
	var i = 0;
	loginUsersAux(array,i,test,callback);
}

function loginUsersAux(array,i,test,callback){
	if(i < array.length){
		var user = array[i];
		User.login(user.username,user.password,function(err,object){
		
			test.ok(!err,"There was an error: "+err);
		    test.ok(object != null, "Token was null");
		    user.err = err;
		    user.token = object;
		    
			i++;	
			loginUsersAux(array,i,test,callback)		
		});
	} else {
		callback();
	}

}

exports.createUsers = function(array,callback){
	var i = 0;
	createUsersAux(array,i,callback);
}
function createUsersAux(array,i,callback){
	if(i < array.length){
		var user = array[i];
		User.create(user.email,user.username,user.password,function(err){
			user.err = err;
			if(err){
				console.log(err);
			}
			i++;	
			createUsersAux(array,i,callback)		
		});
	} else {
		callback();
	}

}

exports.randomUsers = function (nRandomUsers){
	var array = new Array();
	for (var i = 0 ; i < nRandomUsers ; i++){
		array.push(randomUser());
	}
	return array;
}


function randomUser(){
	var username = Utils.randomString(6);
	var password = Utils.randomString(8);
	var email = Utils.randomString(5)+"@"+Utils.randomString(5)+".com";
	return {email:email,username:username,password:password};
}
