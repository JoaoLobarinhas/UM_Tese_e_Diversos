var express = require('express');
var router = express.Router();
var passport = require('passport')
var axios = require('axios');

var url = "http://localhost:3005"

/* GET home page. */
router.get('/checkEmail/:email', function(req, res, next){
  if(req.query.sn){
    axios.get(url+"/users/checkEmail/"+req.params.email+"?sn="+req.query.sn)
      .then(dados =>{res.jsonp(dados.data)})
      .catch(e =>res.status(500).jsonp(e))
  }
  else{
    axios.get(url+"/users/checkEmail/"+req.params.email)
      .then(dados =>{res.jsonp(dados.data)})
      .catch(e =>res.status(500).jsonp(e))
  }
});

router.get('/download/:idFile',function(req,res,next){
  axios.get(url+'/public/one/'+req.params.idFile)
    .then(data =>{
      const img = data.data[0]
      base64img = _arrayBufferToBase64(img.file.file.data)
      srcFile = "data:"+img.file.filetype+";base64,"+base64img
      res.download(srcFile)
    })
    .catch(e =>res.status(500).jsonp(e))
})

router.get('/checkSN/:sn', function(req, res, next) {
  axios.get(url+"/users/checkSN/"+req.params.sn)
    .then(dados =>res.jsonp(dados.data))
    .catch(e => res.status(500).jsonp(e))
});

router.get('/photos/:sn',function(req, res, next) {
  axios.get(url+"/users/photos/"+req.params.sn)
    .then(dados =>res.jsonp(dados.data))
    .catch(e => res.status(500).jsonp(e))
});

function _arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  var image = Buffer.from(binary,'binary').toString('base64');
  return image
}

function verificaAutenticacao(req,res,next){
  if(req.isAuthenticated()){
    next();
  } else{
    res.redirect(thisHost+"/home");}
}

module.exports = router;

