var apiClientBase = require('./apiclientbase');



exports.search = function(latitude,longitude,radius,text,userLatitude,userLongitude,token,callback){
	var params ={
                latitude:latitude,
                longitude:longitude,
                radius:radius,
                text:text,
                userLatitude:userLatitude,
                userLongitude:userLongitude,
                token:token};

	apiClientBase.post('/api/mark/search',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}


exports.view = function(markId,latitude,longitude,token,callback){
    var params ={markId:markId,
        longitude:longitude,
        latitude:latitude,
        token:token};
    apiClientBase.post('/api/mark/view',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}

exports.favourite = function(markId,token,callback){
    var params ={
        markId:markId,
        token:token
    };
    apiClientBase.post('/api/mark/favourite',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null);
        }
    });
}

exports.unfavourite = function(markId,token,callback){
    var params ={
        markId:markId,
        token:token
    };
    apiClientBase.post('/api/mark/unfavourite',params,function(code,headers,data){
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
    apiClientBase.post('/api/mark/favourite/list',params,function(code,headers,data){
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
    apiClientBase.post('/api/mark/user/public/list',params,function(code,headers,data){
        if(code != 200){
            callback("The server responded with an invalid code: "+code+" : "+data,code);
        } else {
            callback(null,JSON.parse(data).response);
        }
    });
}