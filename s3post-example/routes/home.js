var express = require('express');
var s3Policy = require("s3-post-policy");
var moment = require("moment");
var epa = require("epa").getEnvironment();
var s3Config = epa.get("s3");

//setup for Mongoose
var mongoose = require("mongoose");
//var Image = require("../models/image");
var User = require("../models/user");

//setup Keen

//setup router and define functions below
var router = express.Router();

router.get('/settings', settings);

router.get('/', home);

router.get('/uploader', uploader);

router.get('/metatag', metatag)

router.get('/gallery', gallery);
router.get('/gallery/:email/:path', getImage);

router.post("/api/s3creds", getCredentials);
router.post("/api/metatags", createTags);

router.get('/logout', userLogout);

function settings(req, res, next){
    var images = req.user.images;
    var email = req.user.email;
    res.render("settings", {images: images, email: email});
}

function home(req, res, next){
    
    res.render("index");    
}

function uploader(req, res, next){
  res.render("uploader", {
        bucketName: s3Config.bucketName
    });    
}

function metatag(req, res, next){
  var images = req.user.images;
  res.render('metatag',{images: images});
}

function gallery(req, res, next){
  var imageUrls=[];
  var images = req.user.images;
  images.forEach(function(el){
      imageUrls.push(el.url.replace('@','%40'));
  });
    console.log(imageUrls);
    res.render("gallery",{images: imageUrls});
    
}

function getImage(req, res, next){
  var path = req.params.path;
  var email = req.params.email;
  

  
  res.render("fullImage",{path: path, email: email});
}

function getCredentials(req, res, next){
    console.log(req.user);
    var userEmail = req.user.email;
    var filename = req.body.filename
    var expires = moment().add(120, "minutes").toISOString();
    var contentType = "image/"
    
    var s3PolicyConfig = {
  id: s3Config.key,
  secret: s3Config.secret,
  date: Date.now(),
  region: s3Config.region,
  bucket: s3Config.bucketName,
  policy: {
    expiration: expires,
    conditions: [
      //{"key": `images/${filename}`},
      {"key": `${userEmail}/${filename}`},
      {"acl": "public-read"},
      //{"success_action_redirect": s3Config.returnUrl},
      {"Content-Type": contentType}
    ]
  }
    }
    var imagePath = `https://s3-us-west-1.amazonaws.com/benjaminadk/${userEmail}/${filename}`;
    var query = {
        email: userEmail
    }
    User.findOne(query, function(err,user){
      if(err){return next(err)}
      
      if(user){
        user.images.push({url: imagePath})
      }
      user.save(function(err){
      if(err){throw err}
      console.log("image url saved to db")
    })
    
    })
    var Policy = s3Policy(s3PolicyConfig)
    res.status(200).json(Policy)
}

function createTags(req, res, next){
  var a = req.body;
  var title = a['meta-title'];
  var url = a['meta-url'];
  var description = a['meta-description'];
  var handle = a['meta-twitter-handle'];
  var image = a['meta-pic'];
  var author = req.user.fullName;
  var payload = [title, url, description, handle, image, author];
  
  res.render('metatag', {data: payload})
  
}

function userLogout(req, res, next){
  req.destroyUserSession();
  res.redirect('/login');
}

module.exports = router;
