var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(name,tag,mediaId,token,callback){
	var params ={name:name,tag:tag,mediaId:mediaId,token:token};
	apiClientBase.post('/api/mapicon/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

 
exports.list = function(token){
	apiClientBase.post('/api/mapicon',{token:token},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+" : "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}