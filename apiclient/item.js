var apiClientBase = require('./apiclientbase');

exports.OPENABILITY_ONLY_ONCE = 0;
exports.OPENABILITY_UNLIMITED = 1;
exports.TYPE_MESSAGE = 0;
exports.TYPE_IMAGE = 1;
exports.TYPE_VIDEO = 2;
exports.VISIBILITY_PRIVATE = 0;
exports.VISIBILITY_PUBLIC = 1;

exports.create = function(type,message,mediaId,latitude,longitude,radius,openability,to,token,callback){
	var params ={type:type,
                message:message,
                mediaId:mediaId,
                latitude:latitude,
                longitude:longitude,
                radius:radius,
                openability:openability,
                to:to,
                token:token};

	apiClientBase.post('/api/item/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}


exports.open = function(itemId,latitude,longitude,token,callback){
    var params ={itemId:itemId,
             longitude:longitude,
                latitude:latitude,
                token:token};
    apiClientBase.post('/api/item/open',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}



exports.searchInboxByLocation = function(showOpened,latitude,longitude,radius,token,callback){
    var params ={showOpened:showOpened,
        longitude:longitude,
        latitude:latitude,
        radius:radius,
        token:token};
    apiClientBase.post('/api/item/search/inbox/by/location',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
