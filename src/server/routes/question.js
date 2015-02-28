var QuestionService = require('../models/question').Service;
var QuestionVoteService = require('../models/questionVote').Service;
var ApiUtils = require('../utils/apiutils');

exports.create = function (req, res) {
    var text = req.body.text;
    var userId = req.body.userId;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var type = req.body.type;
    QuestionService.create(type, text, latitude, longitude, userId, function (err, results) {
      if (err) {
        ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
      } else {
        ApiUtils.api(req, res, ApiUtils.OK, null, results);
      }
    });
};

exports.view = function (req, res) {
  var questionId = req.body.questionId;
  var userId = req.body.userId;
  QuestionService.view(questionId, userId, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};


exports.recent = function (req, res) {
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }

  QuestionService.recent(userId, page, numItems, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};

exports.trending = function (req, res) {
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }

  QuestionService.trending(userId, page, numItems, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};

exports.popular = function (req, res) {
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }

  QuestionService.popular(userId, page, numItems, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};

exports.mine = function (req, res) {
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }

  QuestionService.mine(userId, page, numItems, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};


exports.favorites = function (req, res) {
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }
  QuestionVoteService.findUpVoteQuestionIds(userId, page, numItems, function(err, questionIds) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      QuestionService.processQuestionIds(questionIds, userId, function (err, results) {
        if (err) {
          ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
        } else {
          ApiUtils.api(req, res, ApiUtils.OK, null, results);
        }
      });
    }
  });


};

exports.commented = function (req, res) {
  var userId = req.body.userId;
  var page = req.body.page;
  var numItems = req.body.numItems;

  if (!page) {
    page = 0;
  }

  if (!numItems) {
    numItems = 50;
  }
  if (numItems < 10) {
    numItems = 10;
  }

  QuestionService.commented(userId, page, numItems, function (err, results) {
    if (err) {
      ApiUtils.api(req, res, ApiUtils.SERVER_INTERNAL_ERROR, err, null);
    } else {
      ApiUtils.api(req, res, ApiUtils.OK, null, results);
    }
  });
};