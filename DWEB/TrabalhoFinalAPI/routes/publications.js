var express = require('express');
var router = express.Router();
var passport = require('passport');
var Public = require('../controllers/publications');

router.get('/one/:id', passport.authenticate('jwt',{session:false}), function(req, res, next){
  Public.getPublication(req.params.id)
    .then(dados => res.jsonp(dados))
    .catch(e => res.status(500).jsonp(e))
})

router.post('/comments', passport.authenticate('jwt',{session:false}), function(req, res, next){
  console.log(req.body.comments)
  Public.getComments(req.body.comments)
    .then(dados => res.jsonp(dados))
    .catch(e => {
      console.log(e)
      res.status(500).jsonp(e)
    })
})

router.post('/feed', passport.authenticate('jwt',{session:false}), function(req, res, next){
  console.log(req.body.following)
  Public.feedPublications(req.body.following)
    .then(dados => res.jsonp(dados))
    .catch(e => {
      console.log(e)
      res.status(500).jsonp(e)
    })
})

router.get('/:studentNumber', passport.authenticate('jwt',{session:false}), function(req, res, next){
    Public.getPublicationOfUser(req.params.studentNumber)
      .then(dados => res.jsonp(dados))
      .catch(e =>{
        console.log(e)
        res.status(500).jsonp(e)
      } )
})

router.post('/', passport.authenticate('jwt',{session:false}), function(req, res, next){
    Public.insert(req.body)
      .then(dados =>{
        res.jsonp(dados)
      } )
      .catch(e =>{
          res.status(500).jsonp(e)})
})

router.put('/:id', passport.authenticate('jwt',{session:false}), function(req, res, next){
  console.log(req.body.id)
  Public.newComment(req.params.id, req.body.id)
    .then(dados => res.jsonp(dados))
    .catch(e =>{
        console.log(e) 
        res.status(500).jsonp(e)})
})

module.exports = router;