var apiClientBase = require('./apiclientbase');



exports.search = function(latitude,longitude,radius,text,token,callback){
	var params ={
                latitude:latitude,
                longitude:longitude,
                radius:radius,
                text:text,
                token:token};

	apiClientBase.post('/api/alias/search',params,function(code,headers,data){
		if(code != 200){
			callback("The server responded with an invalid code: "+code+" : "+data,code);
		} else {
	    	callback(null,JSON.parse(data).response);
	    }
    });
}

