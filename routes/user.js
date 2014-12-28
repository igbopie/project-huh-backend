var User = require('../models/user').User;
var UserService = require('../models/user').Service;
var MediaService = require('../models/media').Service;
var FriendService = require('../models/friend').Service;
var MediaVars = require('../models/media');
var ApiUtils = require('../utils/apiutils');
var SMS = require('../utils/sms');
var Q = require("q");


exports.create = function (req, res) {

  //req.query. for GET
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;

  // Using RegEx - search is case insensitive
  UserService.findUserByUsername(username, function (err, doc) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else if (doc) {
      ApiUtils.api(req, res, ApiUtils.CLIENT_USERNAME_ALREADY_EXISTS, "Username already exists", null);
    } else {

      UserService.findUserByEmail(email, function (err, doc) {
        if (err) {
          ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else if (doc) {
          ApiUtils.api(req, res, ApiUtils.CLIENT_EMAIL_ALREADY_EXISTS, "Email already exists", null);
        } else {
          var newUser = new User();
          newUser.email = email;
          newUser.username = username;
          newUser.password = password;
          newUser.save(function (err) {
            if (!err) {
              ApiUtils.api(req, res, ApiUtils.OK_CREATED, null, null);
            } else {
              ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            }
          });

        }
      });
    }
  });
}


exports.login = function (req, res) {

  var username = req.body.username;
  var password = req.body.password;
  // Using RegEx - search is case insensitive
  UserService.findUserByUsername(username, function (err, doc) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    }
    if (!doc) {
      ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_FAILED, "Invalid user or password", null);
    } else {
      doc.comparePassword(password, function (err, isMatch) {
        if (err) {
          ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else if (!isMatch) {
          ApiUtils.api(req, res, ApiUtils.CLIENT_LOGIN_FAILED, "Invalid user or password", null);
        } else {
          doc.createToken(function (err, token) {
            if (err) {
              ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else {
              ApiUtils.api(req, res, ApiUtils.OK, null,
                {
                  token: token,
                  userId: doc._id,
                  user: {
                    _id: doc._id,
                    username: doc.username,
                    mediaId: doc.mediaId,
                    bio: doc.bio,
                    name: doc.name
                  }
                });
            }
          });
        }
      });
    }
  });
}

exports.extendToken = function (req, res) {
  var token = req.body.token;
  UserService.extendToken(token, function (err) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, null);
    }
  });
};

exports.profile = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var fields = {
      username: 1,
      mediaId: 1,
      name: 1,
      bio: 1,
      postCount: 1,
      markCount: 1,
      points: 1,
      backgroundMediaId: 1
    };
    var username = req.body.username;
    var isMe = false;
    if (username.toLowerCase() == user.username) {
      //is me?
      fields.phone = 1;
      fields.facebookId = 1;
      fields.email = 1;
      isMe = true;
    }
    UserService.findUserProfile(username, fields, function (err, userProfile) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else if (userProfile == null) {
        ApiUtils.api(req, res, ApiUtils.CLIENT_ENTITY_NOT_FOUND, null, null);
      } else {
        if (!isMe) {
          FriendService.isFriend(user._id, userProfile._id, function (err, isFriend) {
            if (err) {
              ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
            } else {
              userProfile = userProfile.toJSON(); //hack to add more properties
              userProfile.isFriend = isFriend;
              ApiUtils.api(req, res, ApiUtils.OK, null, userProfile);
            }
          });
        } else {
          ApiUtils.api(req, res, ApiUtils.OK, null, userProfile);
        }
      }
    });
  });

}


exports.update = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var email = req.body.email;
    var backgroundMediaId = req.body.backgroundMediaId;
    var mediaId = req.body.mediaId;
    var facebookId = req.body.facebookId;
    var name = req.body.name;
    var bio = req.body.bio;
    var changedMedia = false;
    var changedBackgroundMediaId = false;

    if (email) {
      user.email = email;
    }
    if (mediaId) {
      user.mediaId = mediaId;
      changedMedia = true;
    }
    if (backgroundMediaId) {
      user.backgroundMediaId = backgroundMediaId;
      changedBackgroundMediaId = true;
    }
    if (facebookId) {
      user.facebookId = facebookId;
    }
    if (bio) {
      user.bio = bio;
    }
    if (name) {
      user.name = name;
    }
    user.modified = new Date();

    user.save(function (err) {
      if (err) return ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);

      var promise = Q.when();
      if (changedMedia) {
        promise.then(function () {
          promise = MediaService.assign(user.mediaId, [], MediaVars.VISIBILITY_PUBLIC, user._id, "User#mediaId");
        });
      }
      if (changedBackgroundMediaId) {
        promise.then(function () {
          return MediaService.assign(user.mediaId, [], MediaVars.VISIBILITY_PUBLIC, user._id, "User#backgroundMediaId");
        })
      }

      promise.catch(function (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      }).done(function () {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      });

    });

  });
}

exports.addPhone = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var phone = req.body.phone;
    user.addPhone(phone, function (err, verficationCode) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        // TODO SEND VERIFICATION CODE
        console.log("SEND code " + verficationCode + " to " + phone);
        SMS.send(phone, "Seem verification code:" + verficationCode, function () {
          ApiUtils.api(req, res, ApiUtils.OK, null, null);
        });
      }
    });
  });
}


exports.verifyPhone = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var phone = req.body.phone;
    var verificationcode = req.body.verificationcode;
    user.verifyPhone(phone, verificationcode, function (err, didVerified) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, didVerified);
      }
    });
  });
}


exports.addApnToken = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var apntoken = req.body.apntoken;
    user.apnToken = apntoken;
    user.apnSubscribeDate = Date.now();
    user.save(function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  });
}


exports.removeApnToken = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    user.apnToken = undefined;
    user.apnSubscribeDate = undefined;
    user.save(function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  });
}


exports.addGcmToken = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var gcmtoken = req.body.gcmtoken;
    user.gcmToken = gcmtoken;
    user.gcmSubscribeDate = Date.now();
    user.save(function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  });
}

exports.removeGcmToken = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    user.gcmToken = undefined;
    user.gcmSubscribeDate = undefined;
    user.save(function (err) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, null);
      }
    });
  });
};


exports.search = function (req, res) {
  ApiUtils.auth(req, res, function (user) {
    var text = req.body.text;
    UserService.search(text,function (err, results) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, results);
      }
    });
  });
};

