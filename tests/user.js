var mongoose = require('mongoose');
var User = require('../apiclient/user');
var nUsers = 100;


function loginUsers(array,test,callback){
	var i = 0;
	loginUsersAux(array,i,test,callback);
}
function loginUsersAux(array,i,test,callback){
	if(i < array.length){
		var user = array[i];
		User.login(user.username,user.password,function(err,object){
		
			test.ok(!err,"There was an error: "+err);
		    test.ok(object != null, "Token was null");
			i++;	
			loginUsersAux(array,i,test,callback)		
		});
	} else {
		callback();
	}

}

function createUsers(array,callback){
	var i = 0;
	createUsersAux(array,i,callback);
}
function createUsersAux(array,i,callback){
	if(i < array.length){
		var user = array[i];
		User.create(user.email,user.username,user.password,function(err){
			i++;	
			createUsersAux(array,i,callback)		
		});
	} else {
		callback();
	}

}

function randomUsers(nRandomUsers){
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


exports.setUp = function (callback) {
		//Resest DB
        mongoose.connect('mongodb://localhost/seem',function() {
        	mongoose.connection.db.dropDatabase(function(){callback();});
        });
        
}

exports.create = function (test) {
	User.create("igbopie@gmail.com","igbopie","123456",function(err){
		test.ok(!err,"There was an error: "+err);
	    test.done();
	});
}

exports.list = function (test) {
	var users = randomUsers(nUsers);
	createUsers(users,function(){
		User.list(function(err,object){
			test.ok(!err,"There was an error: "+err);
		    test.ok(object != null, "List was null");
		    //TODO test users are in that list
		    test.done();
		});
	});
}


exports.login = function (test) {
	var users = randomUsers(100);
	createUsers(users,function(){
		loginUsers(users,test,function(){
		    test.done();
		});
	});
}

