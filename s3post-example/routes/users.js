var express = require('express');
var router = express.Router();
var User = require("../models/user");


router.get('/signup', signup);
router.post('/signup', userSignup);

router.get('/login', login);
router.post('/login', userLogin);

function signup(req, res, next){
  res.render("signup");
}

function userSignup(req, res, next){
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var password = req.body.password;
  var images = [];
  var profilePic = '';
  
  function save(user){
    user.save(function(err){
        if(err){throw err}
        console.log('new user saved to db');
      });
  }
  
  User.findByEmail(email, function(err, user){
    if(err){throw err}
    
    if(!user){
      var user = new User({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        profilePic: profilePic,
        images: images
      });
      
      user.validate(function(err){
        if(!err){
          save(user);
          res.redirect('/login')
          return;
        }
        var error = [];
        for (var path in err.errors){
          if (err.errors.hasOwnProperty(path)){
            error.push(err.errors[path]);
        }
      }
       
      res.render("signup",{error: error});
      });
    }
    else{
      console.log('user already exists');
      res.render("signup",{error: "User already exists with current email address"})
    }
  });
  
  
}

function login(req, res, next){
  var error = req.query.error;
  res.render("login",{error: error});
}

function userLogin(req, res, next){
  var email = req.body.email;
  var password = req.body.password;

  User.attemptLogin(email, password, function(err, user){  
    if(err){return next(err)}
    
    var isAuthenticated = (!!user);
    if(isAuthenticated){
      req.createUserSession(user, function(err){
        if (err) { return next(err); }
      res.redirect('/')
      //successful login
    });
    }
    else{
      res.redirect('/login?error=Invalid Email or Password');
      //error if user is not in database
    }
  });
}


module.exports = router;
