var apiClientBase = require('./apiclientbase');


exports.create = function(filepath,token,callback){
	var params ={token:token};
	apiClientBase.postFile("/api/media/create",filepath,params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}