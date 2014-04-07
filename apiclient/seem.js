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

exports.getItem = function(itemId,callback){
    var params ={itemId:itemId};
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

