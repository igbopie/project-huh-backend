var utils = {};
var mongoose = require('mongoose');

utils.randomString = function (length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

utils.randomNumber = function (length) {
  var text = "";
  var possible = "0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

utils.extractTags = function (sentence) {
  var tags = sentence.match(/[#]+[A-Za-z0-9_]+/g); //.toLowerCase() case sensitive
  if (!tags) {
    return [];
  }
  //Remove repeated
  for (var i = 0; i < tags.length; i++) {
    for (var j = (i + 1); j < tags.length; j++) {
      if (tags[i].toLowerCase() == tags[j].toLowerCase()) {
        tags.splice(j, 1);
        j--;
      }

    }

  }
  return tags;
}


utils.joinToUser = function (schema, userProp, userIdPropName, usernamePropName) {
  if (userProp === undefined) {
    userProp = "user";
  }
  if (userIdPropName === undefined) {
    userIdPropName = "userId";
  }
  if (usernamePropName === undefined) {
    usernamePropName = "username";
  }
  schema.virtual(userIdPropName).get(function () {
    if (this[userProp] instanceof mongoose.Types.ObjectId) {
      return this[userProp];
    } else if (this[userProp] != undefined) {
      return this[userProp]._id;
    }
    return undefined;
  });
  schema.virtual(usernamePropName).get(function () {
    if (this[userProp] instanceof mongoose.Types.ObjectId) {
      return undefined;
    } else if (this[userProp] != undefined) {
      return this[userProp].username;
    }

    return undefined;
  });
  schema.set('toJSON', {getters: true, virtuals: true});
  schema.set('toObject', {getters: true, virtuals: true});
  schema.method('toJSON', function () {
    var me = this.toObject();
    if (this[userProp] instanceof mongoose.Types.ObjectId) {
      delete me[userProp];
    }
    /*else {
     delete me[userProp].id;
     }*/

    return me;
  });
}
/**
 * This is like a map function but with a callback so it can be used
 * asynchronous
 * @param array
 * @param mapFunction (Item,Callback)
 * @param callback
 */
utils.map = function (array, mapFunction, callback) {
  if (array.length == 0) {
    callback(array);
  } else {
    var callbacked = 0;
    for (var i = 0; i < array.length; i++) {
      (function (index) {
        mapFunction(array[index], function (newArrayItem) {
          array[index] = newArrayItem;
          callbacked++;
          if (callbacked == array.length) {
            callback(array);
          }

        });
      })(i);
    }
  }
}
//ERROR HANDLING
function HuhError(code, message) {
  this.code = code;
  this.message = message;
}
utils.HuhError = HuhError;
utils.error = function (code, message) {
  return new HuhError(code, message);
}

utils.ERROR_CODE_UNAUTHORIZED = 400100;
utils.ERROR_CODE_NOTFOUND = 400101;

// export the class
module.exports = utils;