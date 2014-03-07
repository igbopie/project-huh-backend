var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(title,visibility,token,callback){
	var params ={title:title,visibility:visibility,token:token};
	apiClientBase.post('/api/seem/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.get = function(seemId,token,callback){
    var params ={seemId:seemId,token:token};
    apiClientBase.post('/api/seem/get',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


