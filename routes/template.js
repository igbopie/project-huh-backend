var TemplateService = require('../models/template').Service;
var ApiUtils = require('../utils/apiutils');


/*
 * GET users listing.
 */

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
