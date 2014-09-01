
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
                image = image.resize(1080, 1080);
                continueProcess(item,image,callback);
            })
        });
    }else{
        image = imageMagick(1080, 1080, "#d3d3d3ff");
        continueProcess(item,image,callback);
    }




}

function continueProcess(item,image,callback){
    var fontDir = process.cwd()+"/public/fonts/roboto-regular.ttf";
    console.log(fontDir);
    //image = image.font(fontDir, 40);
    //image = image.blur(0,40);
    image = image.resize(25,25);
    image = image.scale(1080,1080);
    if(item.message) {
        image = image.out("-fill", "black");
        image = image.out("-colorize", "13%");
    }

    var textImage = imageMagick(150, 150,"#00000000");
    textImage = textImage.font(fontDir, 10);
    textImage = textImage.fill("#ffffff");
    textImage = textImage.out("-gravity","center");
    textImage = textImage.out("-stroke","white");
    textImage = textImage.out("-strokewidth","4");
    textImage = textImage.out("-draw","text 0,0 '"+(item.message));


    //textImage = textImage.blur(0,2);
    textImage = textImage.scale(1080,1080);
    textImage = textImage.blur(0,6);

    var textImageTempPath = temp.path()+".png";
    textImage.write(textImageTempPath, function (err) {
        console.log(err);


        var backgroundTempPath = temp.path() + ".jpg";

        image.write(backgroundTempPath, function (err) {

            console.log(err);

            var composition = temp.path() + ".jpg";
            imageMagick()
                .in('-page', '+0+0')
                .in(backgroundTempPath)
                .in('-page', '+0+0') // location of smallIcon.jpg is x,y -> 10, 20
                .in(textImageTempPath)
                .mosaic()
                .write(composition, function (err) {
                    if (err) console.log(err);
                    MediaService.create(composition, "preview", "image/jpg", item.userId, function (err, mId) {

                        console.log(err);
                        item.previewMediaId = mId;
                        callback(item);
                    });
                });


        });
    });
}