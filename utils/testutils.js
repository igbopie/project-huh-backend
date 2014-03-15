var mongoose = require('mongoose');
var User = require('../apiclient/user');
var Utils = require('../utils/utils');

exports.cleanDatabase = function(callback){
    var db = mongoose.createConnection();
	//Resest DB
    db.open('mongodb://localhost/seem',function(err) {
        if(err) {
            console.log(err);
            callback(err);
            return;
        }
        db.collection('users').remove( function(err) {
            if(err) {
                console.log(err);
                callback(err);
                return;
            }
            db.collection('media').remove(	function(err) {
                if(err) {
                    console.log(err);
                    callback(err);
                    return;
                }
                db.collection('follows').remove(	function(err) {
                    if(err) {
                        console.log(err);
                        callback(err);
                        return;
                    }
                    db.collection('seems').remove(	function(err) {
                        if(err) {
                            console.log(err);
                            callback(err);
                            return;
                        }
                        db.collection('m1seems').remove(	function(err) {
                            if(err) {
                                console.log(err);
                                callback(err);
                                return;
                            }
                            db.collection('m1items').remove(	function(err) {
                                if(err) {
                                    console.log(err);
                                    callback(err);
                                    return;
                                }
                                db.close(function(err){
                                    if(err) {
                                        console.log(err);
                                        callback(err);
                                        return;
                                    }
                                    callback();
                                });
                            });
                        });
                    });
                });
			});
		});
    });
}

exports.findDBUser = function(username,callback){
    var db = mongoose.createConnection();
    //Resest DB
    db.open('mongodb://localhost/seem',function(err) {
        if(err) {
            console.log(err);
            callback(err);
            return;
        }
        db.collection('users').findOne({username:username},function(err,user){
            if(err){
                callback(err);
            }else{
                db.close(function(err){
                    if(err) {
                        console.log(err);
                        callback(err);
                        return;
                    }
                    callback(null,user);
                });
            }

        });
    });
}


exports.loginUsers = function(array,callback){
	var i = 0;
	loginUsersAux(array,i,callback);
}

function loginUsersAux(array,i,callback){
	if(i < array.length){
		var user = array[i];
		User.login(user.username,user.password,function(err,object){
		
			if(err) return callback(err);

		    user.err = err;
		    user.token = object;
		    
			i++;	
			loginUsersAux(array,i,callback)
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
                return callback(err);
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
