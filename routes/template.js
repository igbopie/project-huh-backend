var TemplateService = require('../models/template').Service;
var ApiUtils = require('../utils/apiutils');


/*
 * GET users listing.
 */


exports.create = function(req, res){
    ApiUtils.auth(req,res,function(user){

        var mediaId = req.body.mediaId;
        var name = req.body.name;
        var price = req.body.price;
        if(user.superadmin) {
            TemplateService.create(name,price,mediaId,user._id,function (err, template) {
                if (err) {
                    ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
                } else {
                    ApiUtils.api(req, res, ApiUtils.OK, null, template._id);
                }
            });
        }else{
            ApiUtils.api(req,res,ApiUtils.CLIENT_ERROR_UNAUTHORIZED,null,null);
        }
    });
};


exports.listTemplates = function(req, res){
    ApiUtils.auth(req,res,function(user){
        TemplateService.findTemplates(function(err,templates){
            if(err){
                ApiUtils.api(req,res,ApiUtils.SERVER_INTERNAL_ERROR,err,null);
            }else{
                ApiUtils.api(req,res,ApiUtils.OK,null,templates);
            }
        });
    });
};
