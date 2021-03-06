// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var FormData = require('form-data');
var fs = require('fs');
var PORT = 3000;
var HOST = 'localhost';
var _ = require("lodash");

exports.post = function (method, params, callback) {
    // Build the post string from an object
    var postData = querystring.stringify(params);
    params = _.extend({}, params); //clone

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length

    }

    if (params && params.token) {
        headers['Authorization'] = "MarkAuth token=\"" + params.token + "\"";
        delete params.token;
    }
    // An object of options to indicate where to post to
    var postOptions = {
        host: HOST,
        port: PORT,
        path: method,
        method: 'POST',
        headers: headers
    };

    // Set up the request
    var postRequest = http.request(postOptions, function (res) {
        var data = "";
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            callback(res.statusCode, res.headers, data);
        });

    });

    // post the data
    postRequest.write(postData);
    postRequest.on('error', function (error) {
        callback(500);
    });
    postRequest.end();

}


exports.postFile = function (method, pathfile, params, callback) {
    var form = new FormData();

    for (var property in params) {
        form.append(property, params[property]);
    }
    form.append('file', fs.createReadStream(pathfile));

    form.submit('http://' + HOST + ":" + PORT + method, function (err, res) {
        // res – response object (http.IncomingMessage)  //
        res.resume();
        if (err) {
            callback(500);
        } else {
            var data = '';
            res.addListener('data', function (chunk) {
                data += chunk;
            });
            res.addListener('end', function () {
                callback(res.statusCode, res.headers, data);
            });
        }
    });

}

exports.postSaveFile = function (method, params, pathfile, callback) {
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
    var file = fs.createWriteStream(pathfile);
    var postRequest = http.request(postOptions, function (res) {
        res.pipe(file);
        file.on('finish', function () {
            file.close();
            callback(res.statusCode, res.headers);
        });
    });

    // post the data
    postRequest.write(postData);
    postRequest.on('error', function (error) {
        console.log(error);
        callback(500);
    });
    postRequest.end();


}