var apiClientBase = require('./apiclientbase');

exports.OPENABILITY_ONLY_ONCE = 0;
exports.OPENABILITY_UNLIMITED = 1;
exports.TYPE_MESSAGE = 0;
exports.TYPE_IMAGE = 1;
exports.TYPE_VIDEO = 2;
exports.VISIBILITY_PRIVATE = 0;
exports.VISIBILITY_PUBLIC = 1;

exports.create = function(title,message,templateId,iconId,mediaId,latitude,longitude,radius,to,address,aliasName,aliasId,token,callback){
	var params ={
                message:message,
                templateId:templateId,
                iconId:iconId,
                mediaId:mediaId,
                latitude:latitude,
                longitude:longitude,
                radius:radius,
                to:to,
                title:title,
                address:address,
                aliasName:aliasName,
                aliasId:aliasId,
                token:token};

	apiClientBase.post('/api/item/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}





exports.searchByLocation = function(latitude,longitude,radius,token,callback){
    var params ={
        longitude:longitude,
        latitude:latitude,
        radius:radius,
        token:token};
    apiClientBase.post('/api/item/search/by/location',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
exports.searchByLocationUserLocation = function(latitude,longitude,radius,userLatitude,userLongitude,token,callback){
    var params ={
        longitude:longitude,
        latitude:latitude,
        radius:radius,
        userLatitude:userLatitude,
        userLongitude:userLongitude,
        token:token};
    apiClientBase.post('/api/item/search/by/location',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.view = function(itemId,latitude,longitude,token,callback){
    var params ={itemId:itemId,
            longitude:longitude,
            latitude:latitude,
            token:token};
    apiClientBase.post('/api/item/view',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.addComment = function(itemId,comment,token,callback){
    var params ={
        itemId:itemId,
        comment:comment,
        token:token
    };
    apiClientBase.post('/api/item/comment/add',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.listCollected = function(token,callback){
    var params ={
        token:token
    };
    apiClientBase.post('/api/item/find/by/collected',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
exports.listSentToMe = function(token,callback){
    var params ={
        token:token
    };
    apiClientBase.post('/api/item/find/by/senttome',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.listSentByMe = function(token,callback){
    var params ={
        token:token
    };
    apiClientBase.post('/api/item/find/by/sentbyme',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}