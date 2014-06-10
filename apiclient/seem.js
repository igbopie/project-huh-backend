var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(title,expire,token,callback){
	var params ={title:title,expire:expire.toISOString(),token:token};
	apiClientBase.post('/api/seem/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.getSeemItems = function(seemId,page,token,callback){
    var params ={seemId:seemId,page:page,token:token};
    apiClientBase.post('/api/seem/items',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.addToSeem = function(seemId,mediaId,caption,token,callback){
    var params ={seemId:seemId,mediaId:mediaId,token:token,caption:caption};
    apiClientBase.post('/api/seem/add',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.findByExpire = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/expire',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.findByExpired = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/expired',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}