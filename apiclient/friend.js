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
exports.requests = function(token,callback){
	var params ={token:token};
	apiClientBase.post('/api/friends/request',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
			callback(null,JSON.parse(data).response);
	    }
    });
}
exports.sendFriendRequest = function(userId,token,callback){
	var params ={userId:userId,token:token};
	apiClientBase.post('/api/friends/request/send',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.acceptFriendRequest = function(userId,token,callback){
	var params ={userId:userId,token:token};
	apiClientBase.post('/api/friends/request/accept',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.declineFriendRequest = function(userId,token,callback){
    var params ={userId:userId,token:token};
    apiClientBase.post('/api/friends/request/decline',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.unfriend = function(userId,token,callback){
    var params ={userId:userId,token:token};
    apiClientBase.post('/api/friends/unfriend',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

 
 