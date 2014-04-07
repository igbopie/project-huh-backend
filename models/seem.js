var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , MAX_RESULTS_ITEMS = 100
  , MAX_LASTEST_ITEMS_SEEM = 5;


var itemSchema = new Schema({
    mediaId : {	type: Schema.Types.ObjectId, required: true},
    created : { type: Date	, required: true, default: Date.now },
    caption : {	type: String, required: false},
    replyTo:  {	type: Schema.Types.ObjectId, required: false, index: { unique: false, sparse: true }},
    replyCount: {type: Number, required:true, default:0},
    seemId: {	type: Schema.Types.ObjectId, required: false},
    depth : {type: Number, required:true, default:0},
    userId:   {	type: Schema.Types.ObjectId, required: false},
    username:{	type: String, required: false}
});


var seemSchema = new Schema({
    created		    :   {   type: Date	, required: true, default: Date.now },
    updated         :   {   type: Date	, required: true, default: Date.now },
    itemId          :   {	type: Schema.Types.ObjectId, required: true},
    itemMediaId     :   {	type: Schema.Types.ObjectId, required: false},
    itemCaption     :   {	type: String, required: false},
    latestItems     :       [itemSchema],
    title           :   {	type: String, required: false},
    itemCount       :   {   type: Number, required:true, default:1},
    userId          :   {	type: Schema.Types.ObjectId, required: false},
    username        :   {	type: String, required: false}
});


seemSchema.index({ itemId: 1 });

var Seem = mongoose.model('seem', seemSchema);
var Item = mongoose.model('item', itemSchema);


//Service?
var service = {};

service.create = function(title,caption,mediaId,user,callback){

    var mainItem = new Item();
    mainItem.mediaId = mediaId;
    mainItem.caption = caption;

    if(user) {
        mainItem.userId = user._id;
        mainItem.username = user.username;
    }

    mainItem.save(function(err){
        if(err) return callback(err);

        var seem = new Seem();
        seem.title = title;
        seem.itemId = mainItem._id;
        if(user) {
            seem.userId = user._id;
            seem.username = user.username;
        }
        seem.itemMediaId = mainItem.mediaId;
        seem.itemCaption = mainItem.caption;
        seem.latestItems.push(mainItem);

        seem.save(function(err){
            if(err){
                callback(err);
            } else {
                mainItem.seemId = seem._id;
                mainItem.save(function(err){
                    callback(null,seem);
                });
            }
        });
    });
}

service.list = function(callback){
    Seem.find(function(err,seemObj){
        callback(err,seemObj);
    });
}

service.getItem = function(id,callback){
    Item.findOne({_id:id},function(err,seemObj){
        callback(err,seemObj);
    });
}

service.getItemReplies = function(id,page,callback){
    Item.find({replyTo:id}).sort({created: -1}).skip(page * MAX_RESULTS_ITEMS).limit(MAX_RESULTS_ITEMS).exec(function(err,docs){
        callback(err,docs);
    });
}

service.reply = function(replyId,caption,mediaId,user,callback){
    service.replyAux(replyId,caption,mediaId,replyId,1,user,callback);

}
service.replyAux = function(replyId,caption,mediaId,nextParent,depth,user,callback){
    Item.findOne({_id:nextParent},function(err,parentItem){
        if(err) return callback(err);
        if(!parentItem) return callback("parent reply not found");

        if(parentItem.replyTo){
            service.replyAux(replyId,caption,mediaId,parentItem.replyTo,depth+1,user,callback);
        }else {
            console.log("ParentItem "+parentItem._id+" Depth:"+depth);
            Seem.findOne({itemId:parentItem._id},function(err,seem){

                if (err) return callback(err)

                var item = new Item();
                item.mediaId = mediaId;
                item.caption = caption;
                item.replyTo = replyId;
                item.depth = depth;
                item.seemId = seem._id;
                if(user) {
                    item.userId = user._id;
                    item.username = user.username;
                }

                item.save(function (err) {
                    if (err) return callback(err);
                    //Update its parent
                    Item.update({_id: replyId}, {$inc: {replyCount: 1}}, function (err) {
                        if (err) return callback(err);
                        //update Seem
                        Seem.update({itemId: parentItem._id},
                            {   $inc: {itemCount: 1},
                                $set:{updated:Date.now()},
                                //$pop: { latestItems: -1 },
                                $push: {latestItems: {
                                            $each: [item],
                                            $slice: -MAX_LASTEST_ITEMS_SEEM
                                        }
                                }
                            }
                            ,
                            function (err) {
                                if (err) return callback(err);
                                //Update seem cache...
                                Seem.update({"latestItems._id": parentItem._id},
                                             {$inc: {"latestItems.$.replyCount": 1}},
                                    function(err)  {
                                        callback(err, item);
                                    }
                                );
                            }
                        );
                    });
                });

            });
        }
    });
}

module.exports = {
    Seem: Seem,
    Item: Item,
    Service:service
};