var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var MediaService = require('../models/media').Service;
var MediaVars = require('../models/media');
var ItemUtils = require('../utils/itemhelper');

var templateSchema = new Schema({
    name        :   { type: String, required: true},
    price       :   { type: Number, required:true},
    mediaId     :   { type: Schema.Types.ObjectId, required: true},
    teaserMediaId:   { type: Schema.Types.ObjectId, required: true}
});


var Template = mongoose.model('Template', templateSchema);


var service = {};

service.create = function (name,price,mediaId,userId,callback){
    var template = new Template();
    template.name = name;
    template.price = price;
    template.mediaId = mediaId;
    ItemUtils.generatePreviewTemplateImage(template,userId,function(err,template){
        if(err) return callback(err);
        template.save(function(err){
            if(err) return callback(err,null);
            MediaService.assign(template.teaserMediaId,[],MediaVars.VISIBILITY_PUBLIC,template._id,"Template#teaserMediaId",function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    MediaService.assign(template.mediaId, [], MediaVars.VISIBILITY_PUBLIC, template._id, "Template#mediaId", function (err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, template);
                        }
                    });
                }
            })

        });

    });
}

service.findById = function (id,callback){
    Template.findOne({_id:id},function(err,doc){
       callback(err,doc);
    });
}


service.findTemplates = function(callback){
    Template.find()
        .exec(function(err,docs){
            callback(err,docs);
        });
}


module.exports = {
    Template: Template,
    Service:service
};

/*

//check init templates
function checkTemplates(){
    var templates =
        [
            {templateId: 1, name: "Note", price:0},
            {templateId: 2, name: "Love", price:0}
        ];

    for (var i = 0; i < templates.length; i++) {
        checkTemplate(templates[i]);
    }

}
function checkTemplate(templateData){
    service.findById(templateData.templateId,function(err,template){
        if(err) return console.error("Error checking template "+templateData.templateId+" :"+err);
        if(template) return console.log("Template "+templateData.templateId+" found, skip.");

        console.log("Template not found, creating.")

        var template = new Template();
        template.templateId = templateData.templateId;
        template.name = templateData.name;
        template.price = templateData.price;
        template.save(function(err){
            if(err) return console.error("Error creating template "+templateData.templateId+" :"+err);
        });
    });
}
checkTemplates();

*/