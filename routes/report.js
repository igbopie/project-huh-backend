var ReportService = require('../models/report').Service;
var ApiUtils = require('../utils/apiutils');

exports.report = function(req, res) {
    ApiUtils.auth(req,res,function(user){
        var itemId = req.body.itemId;
        var markId = req.body.markId;
        var userId = req.body.userId;
        var message = req.body.message;

        ReportService.createReport(user._id,itemId,markId,userId,message,function(err,doc) {
            if(err) return ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);

            ApiUtils.api(req, res, ApiUtils.OK, null, doc._id);
        });

    });
}


exports.list = function(req, res){
    ApiUtils.auth(req,res,function(user){

        if(user.superadmin) {
            ReportService.list(function (err, docs) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, docs);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }

    });
};