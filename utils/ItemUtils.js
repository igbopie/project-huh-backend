

//TODO
module.exports.generatePreviewImage = function(item,callback){
    item.previewMediaId = item.mediaId;
    callback(item);
}