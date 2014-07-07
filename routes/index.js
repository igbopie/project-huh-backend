
var dateUtils = require('date-utils');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};


exports.imageupload = function(req, res){
    res.render('imageupload', { title: 'Express' });
};

exports.item = function(req, res){

    var itemId = req.params.itemId;

    /*SeemService.getItem(itemId,function(err,item){
        if(err){
            res.status(500);
            res.render('error', { err: err });
        } else if(!item){
            res.status(404);
            res.render('404', {  });
        } else if(item){
            res.render('item', {item:item,dateUtils:dateUtils});
        }
    });*/
};