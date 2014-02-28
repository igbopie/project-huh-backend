var mongoose = require('mongoose');
var User = require('../apiclient/user');

exports.cleanDatabase = function(callback){
	//Resest DB
    mongoose.connect('mongodb://localhost/seem',function() {
    	mongoose.connection.collection('users').remove( function(err) {callback();});
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
	var username = randomString(6);
	var password = randomString(8);
	var email = randomString(5)+"@"+randomString(5)+".com";
	return {email:email,username:username,password:password};
}

function randomString(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}