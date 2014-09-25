var MarkService = require('../models/mark').Service;
var ApiUtils = require('../utils/apiutils');

exports.search = function(req, res) {
    ApiUtils.auth(req,res,function(user) {
        var text = req.body.text;
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var userLatitude = req.body.userLatitude;
        var userLongitude = req.body.userLongitude;
        var radius = req.body.radius;
        MarkService.search(latitude,longitude,radius,text,userLatitude,userLongitude,user._id,function(err,results){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,results);
            }
        });
    });
};

