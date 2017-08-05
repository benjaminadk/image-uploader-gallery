// iamConfig.js
// ------------

// require your user object
var User = require("../models/user");

module.exports = function(iam){

  // get a user token from the currently logged in user
  iam.getUserToken(function(user, cb){
    var token = {
      id: user.id
    };

    cb(null, token);
  });

  // on subsequent requests, turn the user token in to
  // the actual user object
  iam.getUserFromToken(function(token, cb){

    // this is the token that we set, above
    // so grab the id and load the user
    var userId = token.id;
    User.findById(userId, function(err, user){
      if (err) { return cb(err); }

      // found the user, so return it here
      return cb(undefined, user);
    });
  });

};