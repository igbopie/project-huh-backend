var apiClientBase = require('./apiclientbase');
 
 
 
exports.friends = function(token,callback){
	var params ={token:token};
	apiClientBase.post('/api/friends',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}


exports.addFriend = function(username,token,callback){
	var params ={username:username,token:token};
	apiClientBase.post('/api/friends/add',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.deleteFriend = function(userId,token,callback){
    var params ={userId:userId,token:token};
    apiClientBase.post('/api/friends/delete',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.blocked = function(token,callback){
    var params ={token:token};
    apiClientBase.post('/api/friends/blocked',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.block = function(userId,token,callback){
    var params ={userId:userId,token:token};
    apiClientBase.post('/api/friends/block',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.unblock = function(userId,token,callback){
    var params ={userId:userId,token:token};
    apiClientBase.post('/api/friends/unblock',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.search = function(query,token,callback){
    var params ={query:query,token:token};
    apiClientBase.post('/api/friends/search',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}




 
 