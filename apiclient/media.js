var apiClientBase = require('./apiclientbase');


exports.create = function(filepath,callback){
	var params ={};
	apiClientBase.postFile("/api/media/create",filepath,params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+ " "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.get = function(id,format,pathfile,callback){
    var params ={};
    apiClientBase.postSaveFile("/api/media/get/"+format+"/"+id,params,pathfile,function(code,headers){
        if(code != 200){
            callback("The server responded with an invalid code:"+code,code);
        } else {
            callback(null);
        }
    });
}

exports.remove = function(id,token,callback){
    var params ={token:token,imageId:id};
    apiClientBase.post("/api/media/remove",params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code:"+code+" "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
