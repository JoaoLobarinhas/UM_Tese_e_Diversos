var express = require('express');
var router = express.Router();
var passport = require('passport');
var Notifi = require('../controllers/notifications');

router.get('/top/:studentNumber', passport.authenticate('jwt',{session:false}), function(req, res, next){
    Notifi.getTopNofications(req.params.studentNumber)
      .then(dados => res.jsonp(dados))
      .catch(e => res.status(500).jsonp(e))
})

router.get('/:studentNumber', passport.authenticate('jwt',{session:false}), function(req, res, next){
    Notifi.getNofications(req.params.studentNumber)
      .then(dados => res.jsonp(dados))
      .catch(e => res.status(500).jsonp(e))
})

router.post('/', passport.authenticate('jwt',{session:false}), function(req, res, next){
    Notifi.addNotification(req.body)
      .then(dados => res.jsonp(dados))
      .catch(e => res.status(500).jsonp(e))
})

module.exports = router;