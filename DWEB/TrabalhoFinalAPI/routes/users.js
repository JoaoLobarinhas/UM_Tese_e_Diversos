var express = require('express');
var router = express.Router();
var passport = require('passport')
var Users = require('../controllers/users')

/* GET users listing. */
router.get('/checkSN/:sn', passport.authenticate('jwt',{session:false}),function(req, res, next) {
  Users.checkSN(req.params.sn)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.get('/checkEmail/:email', passport.authenticate('jwt',{session:false}), function(req, res, next) {
  if(req.query.sn){
    Users.checkEmailAndSn(req.params.email,req.query.sn)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
  }
  else{
    Users.checkEmail(req.params.email)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
  }
})

router.put('/follow/:email', passport.authenticate('jwt',{session:false}),function(req, res, next) {
  Users.startFollow(req.params.email,req.query.sn)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.put('/followed/:email', passport.authenticate('jwt',{session:false}),function(req, res, next) {
  Users.getStudentNumber(req.params.email)
  .then(dados =>{
    console.log(dados.studentNumber)
    Users.getFollowed(req.query.sn,dados.studentNumber)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
  })
  .catch(e => res.status(500).jsonp(e))
})

router.put('/stopFollow/:email', passport.authenticate('jwt',{session:false}),function(req, res, next) {
  Users.stopFollow(req.params.email,req.query.sn)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.put('/unfollowed/:email', passport.authenticate('jwt',{session:false}),function(req, res, next) {
  Users.getStudentNumber(req.params.email)
  .then(dados =>{
    console.log(dados.studentNumber)
    Users.unFollowed(req.query.sn,dados.studentNumber)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
  })
  .catch(e => res.status(500).jsonp(e))
})

router.get('/googleLogin/:email', passport.authenticate('jwt',{session:false}), function(req, res, next){
  Users.loginGoogle(req.params.email)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.put('/googleRegister/:email', passport.authenticate('jwt',{session:false}), function(req, res, next){
  Users.updateGoogleAccount(req.params.email,req.body)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.get('/photos/:sn', passport.authenticate('jwt',{session:false}), function(req, res, next){
  Users.getUserProfilePics(req.params.sn)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.get('/photosProfile/:email', passport.authenticate('jwt',{session:false}), function(req, res, next){
  Users.getUserPic(req.params.email)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.get('/following/:email', passport.authenticate('jwt',{session:false}), function(req, res, next){
  if(req.query.sn){
    Users.checkIfFollow(req.params.email,req.query.sn)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
  }
})

router.get('/login/:email', passport.authenticate('jwt',{session:false}), function(req, res, next) {
  Users.loginUser(req.params.email)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
});

router.get('/checkUser/:email', passport.authenticate('jwt',{session:false}), function(req, res, next) {
  Users.checkUser(req.params.email)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
});

router.get('/getUserProfile/:sn', passport.authenticate('jwt',{session:false}), function(req, res, next) {
  Users.getUserProfile(req.params.sn)
    .then(dados =>{
      res.jsonp(dados)})
    .catch(e => res.status(500).jsonp(e))
});


router.get('/getCurrentProfile/:email', passport.authenticate('jwt',{session:false}), function(req, res, next) {
  Users.getCurrentUser(req.params.email)
    .then(dados =>{
      res.jsonp(dados)})
    .catch(e => res.status(500).jsonp(e))
});

router.get('/:studentNumber', passport.authenticate('jwt',{session:false}), function(req, res, next) {
  Users.getUser(req.params.studentNumber)
    .then(dados =>res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
});

router.post('/', passport.authenticate('jwt',{session:false}), function(req, res, next){
  Users.insert(req.body)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

module.exports = router;
