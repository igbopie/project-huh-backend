
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

    var auth = parseAuth(req.headers['authorization']);

    if(auth && auth.scheme == "MarkAuth"){
        token = auth.token;
    }

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

function parseAuth(auth) {
    if (!auth || typeof auth !== 'string') {
        return;
    }

    var result = {}, parts, decoded, colon;

    parts = auth.split(' ');

    result.scheme = parts[0];
    if (result.scheme !== 'Basic') {
        for(var i = 1; i < parts.length;i++){
            var vars = parts[i].split('=');
            result[vars[0]]=vars[1].substring(1,vars[1].length-1);//remove "
        }
        return result;
    }

    decoded = new Buffer(parts[1], 'base64').toString('utf8');
    colon = decoded.indexOf(':');

    result.username = decoded.substr(0, colon);
    result.password = decoded.substr(colon + 1);

    return result;
};


// export the class
module.exports = apiUtils;