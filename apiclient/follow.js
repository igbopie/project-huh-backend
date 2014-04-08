var apiClientBase = require('./apiclientbase');
 
 
 
exports.followers = function(page,username,callback){
	var params ={page:page,username:username};
	apiClientBase.post('/api/followers',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.following = function(page,username,callback){
	var params ={page:page,username:username};
	apiClientBase.post('/api/following',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
			callback(null,JSON.parse(data).response);
	    }
    });
}
exports.follow = function(username,token,callback){ 
	var params ={username:username,token:token};
	apiClientBase.post('/api/follow',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.unfollow = function(username,token,callback){ 
	var params ={username:username,token:token};
	apiClientBase.post('/api/unfollow',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.notification = function(token,callback){ 
	var params ={token:token};
	apiClientBase.post('/api/notification',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}


 
 