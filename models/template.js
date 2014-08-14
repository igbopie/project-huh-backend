var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var templateSchema = new Schema({
    templateId  :   { type: Number, required:true,  default:1,  unique: true},
    name        :   { type: String, required: true},
    price       :   { type: Number, required:true}
});


var Template = mongoose.model('Template', templateSchema);


var service = {};

service.findById = function (id,callback){
    Template.findOne({templateId:id},function(err,doc){
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