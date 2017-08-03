var express = require('express');
var s3Policy = require("s3-post-policy");
var moment = require("moment");
var epa = require("epa").getEnvironment();
var s3Config = epa.get("s3");

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${s3Config.mlabUser}:${s3Config.mlabPassword}@ds011810.mlab.com:11810/benjaminadk`, {useMongoClient: true});
var Schema = mongoose.Schema;
var imageSchema = new Schema({
  url: {
    type: String,
    unique: true
  }
});
var Image = mongoose.model('Image', imageSchema);

var router = express.Router();
router.get('/', home);
router.get('/success', success);
router.get('/success/:path', getImage);
router.post("/api/s3creds", getCredentials);



function home(req, res, next){
   
    res.render("index", {
        bucketName: s3Config.bucketName
    });    
}

function success(req, res, next){
  var imageUrls=[];
 
  var test = Image.find({}, function(err,docs){
    if(err){throw err}
   docs.forEach(function(el){
    imageUrls.push(el.url)
  })
    
    res.render("success",{images: imageUrls});
  })
    
}

function getImage(req, res, next){
  var imagePath = req.params.path;
  console.log(imagePath);
  res.render("fullImage",{image: imagePath});
}

function getCredentials(req, res, next){
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

module.exports = router;
