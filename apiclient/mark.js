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

