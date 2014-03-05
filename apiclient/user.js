var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(email,username,password,callback){ 
	var params ={email:email,username:username,password:password};
	apiClientBase.post('/api/user/create',params,function(code,headers,data){
		if(code != 201){
			callback("The server responded with an invalid code: "+code+" : "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

 
exports.login = function(username,password,callback){ 
	apiClientBase.post('/api/user/login',{username:username,password:password},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+" : "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.profile = function(username,token,callback){
    apiClientBase.post('/api/user/profile',{username:username,token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
exports.update = function(email,facebookId,profileImageId,token,callback){
    apiClientBase.post('/api/user/update',{email:email,facebookId:facebookId,profileImageId:profileImageId,token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.addPhone = function(phone,token,callback){ 
	apiClientBase.post('/api/user/addphone',{phone:phone,token:token},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+" : "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.verifyPhone = function(phone,verificationCode,token,callback){ 
	apiClientBase.post('/api/user/verifyphone',{phone:phone,verificationcode:verificationCode,token:token},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+" : "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

