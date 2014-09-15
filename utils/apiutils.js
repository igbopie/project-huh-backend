
var UserService = require('../models/user').Service;

var ApiResponse = function(code,message,responseObject){
	this.code = code;
	this.message = message;
	this.response = responseObject;
};


var apiUtils = {};
// http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
apiUtils.OK = 200; 
apiUtils.OK_CREATED = 201;
apiUtils.OK_ACCEPTED = 202;
apiUtils.OK_CUSTOM = 250; //someday can be usefull

// CUSTOM 460-480
apiUtils.CLIENT_ERROR_BAD_REQUEST = 400; 
apiUtils.CLIENT_ERROR_UNAUTHORIZED = 401;
apiUtils.CLIENT_LOGIN_TIMEOUT = 440; 
apiUtils.CLIENT_LOGIN_FAILED = 460; 
apiUtils.CLIENT_ENTITY_ALREADY_EXISTS = 465;
apiUtils.CLIENT_USERNAME_ALREADY_EXISTS = 466;
apiUtils.CLIENT_EMAIL_ALREADY_EXISTS = 467;
apiUtils.CLIENT_ENTITY_NOT_FOUND = 470;


// CUSTOM 560-580
apiUtils.SERVER_INTERNAL_ERROR = 500;
apiUtils.SERVER_NOT_IMPLEMENTED = 501;

apiUtils.api = function(req,res,code,message,responseObject){
    if(code == apiUtils.SERVER_INTERNAL_ERROR){
        console.error(message);
        res.setHeader("Error", message);
    }
	res.json(code, new ApiResponse(code,message,responseObject)); 		
}

apiUtils.auth = function(req,res,callback){
    var token = req.body.token;
    //console.log(req);
    if(token) {
        UserService.findUserByToken(token, function (err, user) {
            if (err) {
                apiUtils.api(req, res, apiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else if (user == null) {
                apiUtils.api(req, res, apiUtils.CLIENT_LOGIN_TIMEOUT, null, null);
            } else {
                callback(user);
            }
        });
    } else {
        apiUtils.api(req, res, apiUtils.CLIENT_ERROR_UNAUTHORIZED, null, null);
    }
}


// export the class
module.exports = apiUtils;