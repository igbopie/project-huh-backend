var apiClientBase = require('./apiclientbase');

exports.OPENABILITY_ONLY_ONCE = 0;
exports.OPENABILITY_UNLIMITED = 1;
exports.TYPE_MESSAGE = 0;
exports.TYPE_IMAGE = 1;
exports.TYPE_VIDEO = 2;
exports.VISIBILITY_PRIVATE = 0;
exports.VISIBILITY_PUBLIC = 1;
/*
* 	var params ={
 message:message,
 templateId:templateId,
 mapIconId:mapIconId,
 mediaId:mediaId,
 latitude:latitude,
 longitude:longitude,
 to:to,
 locationAddress:locationAddress,
 locationName:locationName,
 markName:markName,
 markId:markId,
 token:token};

 * */
exports.create = function(params,callback){
	apiClientBase.post('/api/mark/item/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

exports.addMedia = function(mediaId,itemId,token,callback){
    var params ={
        mediaId:mediaId,
        itemId:itemId,
        token:token};

    apiClientBase.post('/api/mark/item/addmedia',params,function(code,headers,data){
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
    apiClientBase.post('/api/mark/item/view',params,function(code,headers,data){
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
    apiClientBase.post('/api/mark/item/comment/add',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.listComments = function(itemId,token,callback){
    var params ={
        itemId:itemId,
        token:token
    };
    apiClientBase.post('/api/mark/item/comment',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}



exports.listItems = function(markId,longitude,latitude,token,callback){
    var params ={
        markId:markId,
        longitude:longitude,
        latitude:latitude,
        token:token
    };
    apiClientBase.post('/api/mark/item',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.favStream = function(token,callback){
    var params ={
        token:token
    };
    apiClientBase.post('/api/mark/item/find/by/stream',params,function(code,headers,data){
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
    apiClientBase.post('/api/mark/item/find/by/senttome',params,function(code,headers,data){
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
    apiClientBase.post('/api/mark/item/find/by/sentbyme',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.favourite = function(itemId,token,callback){
    var params ={
        itemId:itemId,
        token:token
    };
    apiClientBase.post('/api/mark/item/favourite',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.unfavourite = function(itemId,token,callback){
    var params ={
        itemId:itemId,
        token:token
    };
    apiClientBase.post('/api/mark/item/unfavourite',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.listFavourite = function(token,callback){
    var params ={
        token:token
    };
    apiClientBase.post('/api/mark/item/favourite/list',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.listUserPublic = function(username,token,callback){
    var params ={
        token:token,
        username:username
    };
    apiClientBase.post('/api/mark/item/user/public/list',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}