var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(email,username,password,callback){ 
	var params ={email:email,username:username,password:password};
	apiClientBase.post('/api/user/create',params,function(code,headers,data){
		if(code != 201){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
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
exports.extendToken = function(token,callback){
    apiClientBase.post('/api/user/extendtoken',{token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null);
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
exports.update = function(email,facebookId,mediaId,bio,name,token,callback){
    apiClientBase.post('/api/user/update',{email:email,facebookId:facebookId,mediaId:mediaId,bio:bio,name:name,token:token},function(code,headers,data){
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

exports.addApnToken = function(apntoken,token,callback){
    apiClientBase.post('/api/user/addapntoken',{apntoken:apntoken,token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null);
        }
    });
}

exports.removeApnToken = function(token,callback){
    apiClientBase.post('/api/user/removeapntoken',{token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null);
        }
    });
}

exports.addGcmToken = function(gcmtoken,token,callback){
    apiClientBase.post('/api/user/addgcmtoken',{gcmtoken:gcmtoken,token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null);
        }
    });
}

exports.removeGcmToken = function(token,callback){
    apiClientBase.post('/api/user/removegcmtoken',{token:token},function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" : "+data);
        } else {
            callback(null);
        }
    });
}
