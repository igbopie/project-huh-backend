var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(title,caption,mediaId,token,callback){
	var params ={title:title,caption:caption,mediaId:mediaId,token:token};
	apiClientBase.post('/api/seem/create',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}
exports.createWithTopic = function(title,caption,mediaId,topicId,token,callback){
    var params ={title:title,caption:caption,mediaId:mediaId,topicId:topicId,token:token};
    apiClientBase.post('/api/seem/create',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.getItem = function(itemId,token,callback){
    var params ={itemId:itemId};
    if(token){
        params.token = token;
    }
    apiClientBase.post('/api/seem/item/get',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.getItemReplies = function(itemId,page,callback){
    var params ={itemId:itemId,page:page};
    apiClientBase.post('/api/seem/item/replies',params,function(code,headers,data){
        //console.log("Data:"+data);
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.list = function(callback){
    var params ={};
    apiClientBase.post('/api/seem',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.reply = function(itemId,caption,mediaId,token,callback){
    var params ={itemId:itemId,caption:caption,mediaId:mediaId,token:token};
    apiClientBase.post('/api/seem/item/reply',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.favourite = function(itemId,token,callback){
    var params ={itemId:itemId,token:token};
    apiClientBase.post('/api/seem/item/favourite',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}


exports.unfavourite = function(itemId,token,callback){
    var params ={itemId:itemId,token:token};
    apiClientBase.post('/api/seem/item/unfavourite',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.thumbUp = function(itemId,token,callback){
    var params ={itemId:itemId,token:token};
    apiClientBase.post('/api/seem/item/thumbup',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.thumbDown = function(itemId,token,callback){
    var params ={itemId:itemId,token:token};
    apiClientBase.post('/api/seem/item/thumbdown',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.thumbClear = function(itemId,token,callback){
    var params ={itemId:itemId,token:token};
    apiClientBase.post('/api/seem/item/thumbclear',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.listTopics = function(callback){
    var params ={};
    apiClientBase.post('/api/seem/topics',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.findByTopic = function(topicId,page,callback){
    var params ={topicId:topicId,page:page};
    apiClientBase.post('/api/seem/by/topic',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.findByHotness = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/hotness',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.findByViral = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/viral',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}


exports.findByCreated = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/created',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}
