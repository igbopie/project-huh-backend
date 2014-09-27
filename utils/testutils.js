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
                db.collection('friends').remove(	function(err) {
                    if(err) {
                        console.log(err);
                        callback(err);
                        return;
                    }
                    db.collection('comments').remove(	function(err) {
                        if(err) {
                            console.log(err);
                            callback(err);
                            return;
                        }
                        db.collection('items').remove(	function(err) {
                            if(err) {
                                console.log(err);
                                callback(err);
                                return;
                            }
                            db.collection('marks').remove(	function(err) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                    return;
                                }

                                db.close(function (err) {
                                    if (err) {
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

exports.createFakeMedia = function(id,callback){
    var db = mongoose.createConnection();
    //Resest DB
    db.open('mongodb://localhost/seem',function(err) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        var media = {"_id":new mongoose.Types.ObjectId(id),test:1};
        db.collection('media').save(media,function(err){
            if (err) {
                callback(err);
            }
            //console.log(media);
            db.close(function(err){
                callback(err);
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
        db.collection('users').findOne({username:username.toLowerCase()},function(err,user){
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

            //console.log(object);
		    user.err = err;
		    user.token = object.token;
		    user.id = object.userId;

			i++;	
			loginUsersAux(array,i,callback)
		});
	} else {
		callback();
	}

}
exports.makeSuperAdmin = function(user,callback){
    var db = mongoose.createConnection();
    db.open('mongodb://localhost/seem',function(err) {
        if(err) return callback(err);
        db.collection('users').update({_id: mongoose.Types.ObjectId(user.id)},{$set: {superadmin:true}},function(err){
            if(err){
                callback(err);
            }else{
                db.close(function(err){
                    if(err) {
                        console.log(err);
                        callback(err);
                        return;
                    }
                    callback(null);
                });
            }

        });
    });
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

