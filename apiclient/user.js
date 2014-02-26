var apiClientBase = require('./apiclientbase');
 
 
exports.list = function(callback){ 
	apiClientBase.post('/api/user',{},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
    
}

exports.login = function(username,password,callback){ 
	apiClientBase.post('/api/user/login',{username:username,password:password},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
    
}


