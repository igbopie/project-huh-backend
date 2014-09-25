
var gm = require('gm')
var imageMagick = gm.subClass({ imageMagick: true });
var MediaService = require('../models/media.js').Service;
var temp = require('temp').track();



exports.generatePreviewTemplateImage = function(template,userId,callback){
    MediaService.findById(template.mediaId,function(err,media){
        if(err) return callback(err);
        if(!media) return callback("could not find media");

        MediaService.get(media,"large",function(err,media){
            if(err) return callback(err);

            var image = imageMagick(media.tempPath);
            image = obscureImage(image);

            var templateTeaserMediaTempPath = temp.path() + ".jpg";
            image.write(templateTeaserMediaTempPath, function (err) {
                if(err) return callback(err);

                MediaService.create(templateTeaserMediaTempPath, "templateTeaserMedia", "image/jpg", userId, function (err, mId) {
                    if(err) return callback(err);

                    template.teaserMediaId = mId;
                    callback(null,template);
                });
            });
        });
    });
}

exports.generatePreviewImage = function(item,callback){
    if(item.mediaId){
        MediaService.findById(item.mediaId,function(err,media){
            if(err) return callback(err);

            MediaService.get(media,"large",function(err,media){
                if(err) return callback(err);

                var image = imageMagick(media.tempPath);
                image = obscureImage(image);

                var teaserMediaTempPath = temp.path() + ".jpg";
                image.write(teaserMediaTempPath, function (err) {
                    if(err) return callback(err);

                    MediaService.create(teaserMediaTempPath, "teaserMedia", "image/jpg", item.userId, function (err, mId) {
                        if(err) return callback(err);

                        item.teaserMediaId = mId;
                        continueTemplateProcess(item, callback);
                    });
                });
            });
        });
    }else{
        continueTemplateProcess(item,callback);
    }

}

function obscureImage(image){
    image = image.resize(25,25);
    image = image.scale(1080,1080);
    return image;
}

function continueTemplateProcess(item,callback) {
    if(item.templateId){
        //WOOT I had to this here....
        var TemplateService = require('../models/template.js').Service;
        TemplateService.findById(item.templateId,function(err,template){
            if(err) return callback(err);

            item.mediaId = template.mediaId;
            item.teaserMediaId = template.teaserMediaId;
            continueMessageProcess(item,callback);
        });
    }else{
        continueMessageProcess(item,callback);
    }

}


function continueMessageProcess(item,callback) {
    if(item.message){
        var tempString = "";
        for(var i = 0; i < item.message.length;i++){
            var char = item.message.charAt(i);
            if(char >= 'A' && char <= 'Z'){
                tempString += "D";
            }else if(char >= 'a' && char <= 'z'){
                tempString += "p";
            } else{
                tempString += char;
            }
        }

        item.teaserMessage = tempString;
    }

    callback(null,item);

}
