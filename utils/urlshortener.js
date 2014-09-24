/**
 * Created by igbopie on 23/09/14.
 */

var BITLY_USERNAME = process.env.BITLY_USERNAME
    , BITLY_TOKEN = process.env.BITLY_TOKEN
    , BITLY_DOMAIN = process.env.BITLY_DOMAIN
    , BITLY_DOMAIN_ITEM_REDIRECT = process.env.BITLY_DOMAIN_ITEM_REDIRECT
    , Bitly = require("bitly");

var bitly;
if(BITLY_TOKEN){
    bitly = new Bitly(BITLY_USERNAME,BITLY_TOKEN);
    console.log("BITLY initialized");
}

exports.shortenItem = function(itemId,callback){
    if(bitly) {
        bitly.shorten(BITLY_DOMAIN_ITEM_REDIRECT + itemId, BITLY_DOMAIN, function (err, response) {
            if (err) {
                return callback(err);
            }
            callback(null, response.data.url);

        });
    }else{
        callback(null,BITLY_DOMAIN_ITEM_REDIRECT + itemId); // no shortlink
    }
}