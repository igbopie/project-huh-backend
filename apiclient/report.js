var apiClientBase = require('./apiclientbase');

exports.create = function(itemId,markId,userId,message,token,callback){
    var params ={
        message:message,
        itemId:itemId,
        markId:markId,
        userId:userId,
        token:token
    };

	  apiClientBase.post('/api/report/create',params,function(code,headers,data){
		    if(code != 200){
			      callback("The server responded with an invalid code: "+code+" : "+data,code);
		    } else {
	    	    callback(null,JSON.parse(data).response);
	      }
    });
};