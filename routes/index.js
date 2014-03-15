
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};


exports.imageupload = function(req, res){
    res.render('imageupload', { title: 'Express' });
};