
var gm = require('gm')
var imageMagick = gm.subClass({ imageMagick: true })
var MediaService = require('../models/media.js').Service;
var TemplateService = require('../models/template.js').Service;
var temp = require('temp').track();

//TODO
exports.generatePreviewImage = function(item,callback){


    if(item.mediaId){
        MediaService.findById(item.mediaId,function(err,media){
            MediaService.get(media,"large",function(err,media){
                var image = imageMagick(media.tempPath);
                image = image.resize(25,25);
                image = image.scale(1080,1080);

                var teaserMediaTempPath = temp.path() + ".jpg";
                image.write(teaserMediaTempPath, function (err) {
                    //TODO if(err) return callback("There was an error processing the image");

                    MediaService.create(teaserMediaTempPath, "teaserMedia", "image/jpg", item.userId, function (err, mId) {
                        //TODO err check
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

function continueTemplateProcess(item,callback) {
    if(item.templateId){
        TemplateService.findById(item.templateId,function(err,template){
            //TODO err
            item.teaserTemplateMediaId = template.teaserMediaId;
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

    callback(item);

}
