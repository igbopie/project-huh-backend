var apiClientBase = require('./apiclientbase');
 
 
 
exports.feed = function(page,token,callback){
	var params ={page:page,token:token};
	apiClientBase.post('/api/feed',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}



exports.feedByUser = function(page,username,callback){
    var params ={username:username,page:page};
    apiClientBase.post('/api/feed/user',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+ " "+data);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
