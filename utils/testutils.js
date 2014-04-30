var mongoose = require('mongoose');
var User = require('../apiclient/user');
var Seem = require('../apiclient/seem');
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
            /*db.collection('media').remove(	function(err) {
                if(err) {
                    console.log(err);
                    callback(err);
                    return;
                }*/
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
                        db.collection('items').remove(	function(err) {
                            if(err) {
                                console.log(err);
                                callback(err);
                                return;
                            }
                            db.collection('feeds').remove(	function(err) {
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
			//});
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



var fakeMediaId = "5343ce700ceeccdd20189502";//fake
exports.createSeemsAndItems = function(nSeems,nItems,users,callback){
    var seemsArray = new Array();
    var itemsArray = new Array();
    var seemName= "Seem name ";
    var itemCaption= "Item caption ";

    auxCreateSeem(0,seemsArray,itemsArray,seemName,itemCaption,nSeems,users,function(err) {
        if (err) {
            return callback(err);
        }
        auxCreateItems(0,itemsArray,itemCaption,nItems,users,function(err) {
            if (err) {
                return callback(err);
            }
            callback(null,seemsArray,itemsArray);
        });
    });
}

function auxCreateSeem(depth,seemsArray,itemsArray,seemName,itemCaption,nSeems,users,callback){
    var randomUserIndex = Math.floor((Math.random()*users.length));
    var randomUser = users[randomUserIndex];

    Seem.create(seemName+depth,itemCaption+depth,fakeMediaId,randomUser.token,function(err,data){
        if(err) return callback(err);
        seemsArray.push(data);
        itemsArray.push(data.itemId);
        if(depth < nSeems  ){
            auxCreateSeem(depth+1,seemsArray,itemsArray,seemName,itemCaption,nSeems,users,callback);
        }else{
            callback(null);
        }
    });
}

function auxCreateItems(depth,itemsArray,itemCaption,nItems,users,callback){

    var randomUserIndex = Math.floor((Math.random()*users.length));
    var randomUser = users[randomUserIndex];

    var randomReplyIndex = Math.floor((Math.random()*itemsArray.length));
    var randomReplyId = itemsArray[randomReplyIndex];
    //console.log("RandomIndex:"+randomReplyIndex+" Size:"+itemsArray.length);

    Seem.reply(randomReplyId,itemCaption+depth,fakeMediaId,randomUser.token,function(err,data){
        if(err) return callback(err);
        itemsArray.push(data._id);
        if(depth < nItems  ){
            auxCreateItems(depth+1,itemsArray,itemCaption,nItems,users,callback);
        }else{
            callback(null);
        }
    });
}