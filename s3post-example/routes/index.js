var express = require("express")
var home = require("./home")
var users = require("./users")

var router = express.Router()

router.use('/', users)

router.use(function(req, res, next){
  if(req.user){
    next()
  }
  else{
    res.redirect('/signup')
  }
})

router.use('/', home)


module.exports = router