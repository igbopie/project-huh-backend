var apiClientBase = require('./apiclientbase');
 
 
 
exports.create = function(title,startDate,endDate,coverPhotoMediaId,publishPermissions,token,callback){
	var params ={title:title,token:token,publishPermissions:publishPermissions};
    if(startDate){
        params.startDate=startDate.toISOString();
    }
    if(endDate){
        params.endDate=endDate.toISOString();
    }
    if(coverPhotoMediaId){
        params.coverPhotoMediaId = coverPhotoMediaId;
    }
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

exports.findByUpdated = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/updated',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.findByAboutToStart = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/abouttostart',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.findByAboutToEnd = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/abouttoend',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.findByEnded = function(page,callback){
    var params ={page:page};
    apiClientBase.post('/api/seem/by/ended',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}