var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(name,tag,mediaId,packId,pointsThreshold,token,callback){
	var params ={name:name,tag:tag,mediaId:mediaId,packId:packId,pointsThreshold:pointsThreshold,token:token};
	apiClientBase.post('/api/mapicon/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.createPack = function(name,mediaId,isFree,pointsThreshold,appStoreCode,token,callback){
    var params ={name:name,mediaId:mediaId,isFree:isFree,pointsThreshold:pointsThreshold,appStoreCode:appStoreCode,token:token};
    apiClientBase.post('/api/mapicon/pack/create',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
 
exports.list = function(timestamp,token,callback){
	apiClientBase.post('/api/mapicon',{timestamp:timestamp,token:token},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+" : "+data);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.listAll = function(timestamp,token,callback){
	apiClientBase.post('/api/mapiconandpack',{timestamp:timestamp,token:token},function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code:"+code+" : "+data);
		} else {
			callback(null,JSON.parse(data).response);
		}
	});
}