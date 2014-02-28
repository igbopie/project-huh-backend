var apiClientBase = require('./apiclientbase');
 
 
 
exports.list = function(token,callback){ 
	var params ={token:token};
	apiClientBase.post('/api/friends',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.add = function(username,token,callback){ 
	var params ={username:username,token:token};
	apiClientBase.post('/api/friends/add',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.pending = function(token,callback){ 
	var params ={token:token};
	apiClientBase.post('/api/friends/pending',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.accept = function(username,token,callback){ 
	var params ={username:username,token:token};
	apiClientBase.post('/api/friends/accept',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.decline = function(username,token,callback){ 
	var params ={username:username,token:token};
	apiClientBase.post('/api/friends/decline',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.remove = function(username,token,callback){ 
	var params ={username:username,token:token};
	apiClientBase.post('/api/friends/remove',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}


 
 