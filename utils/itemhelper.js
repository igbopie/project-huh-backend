
var gm = require('gm')
var imageMagick = gm.subClass({ imageMagick: true })
var MediaService = require('../models/media.js').Service;
var temp = require('temp').track();

//TODO
exports.generatePreviewImage = function(item,callback){

    var backgroundMediaId = null;
    if(item.templateId){
        //TODO not supported yet
        //backgroundMediaId = item.templateId;
    }else if(item.mediaId){
        backgroundMediaId = item.mediaId;
    }

    var image;
    //go to media and get it
    if(backgroundMediaId){
        MediaService.findById(backgroundMediaId,function(err,media){
            MediaService.get(media,"large",function(err,media){
                image = imageMagick(media.tempPath);
                image = image.blur(0,50)
                continueProcess(item,image,callback);
            })
        });
    }else{
        image = imageMagick(500, 500, "#d3d3d3ff");
        continueProcess(item,image,callback);
    }




}

function continueProcess(item,image,callback){
    var fontDir = __dirname+"/../public/fonts/blokkneue-regular.ttf";
    console.log(fontDir);
    image = image.font(fontDir, 40)
    image = image.drawText(10, 250, item.message?item.message:"Paco deberias poner algo");

    var tempPath = temp.path()+".jpg";
    image.write(tempPath, function (err) {

        console.log(err);
        MediaService.create(tempPath, "preview", "image/jpg", item.userId, function (err, mId) {

            console.log(err);
            item.previewMediaId = mId;
            callback(item);
        });

    });
}