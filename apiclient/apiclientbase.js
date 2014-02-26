// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var PORT = 3000;
var HOST = 'localhost';

exports.post = function(method,params,callback) {
	// Build the post string from an object
	var postData = querystring.stringify(params);
	
	// An object of options to indicate where to post to
	var postOptions = {
		host: HOST,
		port: PORT,
		path: method,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
			}
	};
	
	// Set up the request
	var postRequest = http.request(postOptions, function(res) {
		var data ="";
		
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			callback(res.statusCode,res.headers,data);		
		
		});
	
	});
	
	// post the data
	postRequest.write(postData);
	postRequest.on('error', function(error) {
		  callback(500);		
	  });
	postRequest.end();

}
