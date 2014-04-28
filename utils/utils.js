var utils = {};

utils.randomString = function(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

utils.randomNumber = function(length)
{
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

utils.extractTags = function(sentence){
    var tags = sentence.match(/[#]+[A-Za-z0-9_]+/g); //.toLowerCase() case sensitive
    if(!tags){
        return [];
    }
    //Remove repeated
    for(var i = 0; i< tags.length;i++){
        for(var j = (i + 1); j< tags.length;j++){
            if(tags[i].toLowerCase() == tags[j].toLowerCase()) {
                tags.splice(j, 1);
                j--;
            }

        }

    }
    return tags;
}

// export the class
module.exports =  utils;