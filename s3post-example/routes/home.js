var express = require('express');
var s3Policy = require("s3-post-policy");
var moment = require("moment");
var epa = require("epa").getEnvironment();
var s3Config = epa.get("s3");

//setup for mongoose
var mongoose = require("mongoose");
var Image = require("../models/image");
var User = require("../models/user");

//setup router and define functions below
var router = express.Router();
router.get('/', home);

router.get('/uploader', uploader);

router.get('/gallery', gallery);
router.get('/gallery/:path', getImage);

router.post("/api/s3creds", getCredentials);

router.get('/logout', userLogout);



function home(req, res, next){
   
    res.render("index");    
}

function uploader(req, res, next){
  res.render("uploader", {
        bucketName: s3Config.bucketName
    });    
}

function gallery(req, res, next){
  var imageUrls=[];
 
  var test = Image.find({}, function(err,docs){
    if(err){throw err}
   docs.forEach(function(el){
    imageUrls.push(el.url)
  })
    
    res.render("gallery",{images: imageUrls});
  })
    
}

function getImage(req, res, next){
  var imagePath = req.params.path;
  
  res.render("fullImage",{image: imagePath});
}

function getCredentials(req, res, next){
    console.log(req.user);
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
      {"key": filename},
      {"acl": "public-read"},
      //{"success_action_redirect": s3Config.returnUrl},
      {"Content-Type": contentType}
    ]
  }
    }
    var imagePath = `https://s3-us-west-1.amazonaws.com/benjaminadk/${filename}`;
    Image.findOne({url: imagePath}, function(err,image){
      if(err){return next(err)}
      
      if(!image){
        image = new Image({url: imagePath});
      }
      image.save(function(err){
      if(err){throw err}
      console.log("image url saved to db")
    })
    
    })
    var Policy = s3Policy(s3PolicyConfig)
    res.status(200).json(Policy)
}

function userLogout(req, res, next){
  req.destroyUserSession();
  res.redirect('/');
}

module.exports = router;
