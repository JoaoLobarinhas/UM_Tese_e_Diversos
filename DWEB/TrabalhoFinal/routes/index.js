var express = require('express');
var router = express.Router();
var passport = require('passport')
const fs = require('fs')
var dateFormat = require('dateformat');
var lhost = require('../config/env').host
var bcrypt = require('bcryptjs')
var axios = require('axios')
var multer = require('multer')
var upload = multer({dest:'uploads/'})

/* GET home page. */
router.get('/', verificaAutenticacao, function(req, res, next) {
  axios.get(lhost+"/users/checkUser/"+req.user.email)
    .then(dados =>{
        const data = dados.data
        if(data.studentNumber){
          axios.get(lhost+"/users/photosProfile/"+req.user.email)
            .then(dados =>{
              const images = dados.data
              var base64img = _arrayBufferToBase64(images.profilePhoto.photo.data)
              var srcProfile = "data:"+images.profilePhoto.filetype+";base64,"+base64img
              var body = {following:data.following}
              axios.post(lhost+"/public/feed",body)
              .then(public =>{
                const publics = public.data
                publics.forEach(element => {
                  console.log(element.owner)
                  base64 = _arrayBufferToBase64(element.owner.photo.data)
                  src = "data:"+element.owner.filetype+";base64,"+base64
                  element.owner.photo = src
                  if(element.file){
                    filePublication64 = _arrayBufferToBase64(element.file.pubCont.data)
                    srcFile = "data:"+element.file.filetype+";base64,"+filePublication64
                    element.file.pubCont=srcFile
                    if(element.file.filetype == "image/jpeg" || element.file.filetype == "image/png" || element.file.filetype == "image/gif"){
                      element.file.image =true
                    }
                    else if(element.file.filetype == "application/pdf"){
                      element.file.pdf = true
                    }
                    else if(element.file.filetype == "application/msword" || element.file.filetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                      element.file.doc =true
                    }
                  }
                });
                res.render('index',{imageP:srcProfile,public:publics})
              })
              .catch(e =>{
                console.log(e)
                res.render('error',{message:e})})
            })
            .catch(e=>{
              console.log(e)
              res.status(500).jsonp(e)
            })
        }
        else{
          res.render('register',{data:data})
        }
      })
    .catch(e => res.status(500).jsonp(e))
});

router.get('/auth/google', passport.authenticate('google', { scope: ['email profile'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/home' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/home', verificaAutenticacaoHome ,function(req, res, next) {
  if(req.query.failedLogin){
    res.render('home',{failed:true});
  }
  else{
    res.render('home');
  }
});

router.get('/logout',verificaAutenticacao,function(req, res, next) {
  req.logout()
  res.redirect('/home')
})

router.post('/home', passport.authenticate('local', 
{ successRedirect: '/',
  failureRedirect: '/home?failedLogin=true',
  badRequestMessage : 'Wrong username or password.',
  failureFlash: true
})
);

router.get('/register',function(req, res, next) {
  res.render('register');
})

router.post('/registerGoogle',upload.fields([{name:'pictureProfile', maxCount: 1},{name:'pictureHeader', maxCount: 1}]), function(req, res, next){
  aux = req.body
  auxf = req.files
  if(aux.firstName != "" && aux.lastName != "" && aux.studentNumber != "" && auxf["pictureProfile"][0].path != "" && auxf["pictureHeader"][0].path != "" && aux.year != "" && aux.yearOfInscription != ""){
    axios.get("http://localhost:3001/aux/checkSN/"+aux.studentNumber)
      .then(data=>{
        if(data.data == true){
        res.render('register',{error:true});
        }
        else{
          var today = new Date()
          today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
          var profilePic = fs.readFileSync(auxf["pictureProfile"][0].path)
          var headerPic = fs.readFileSync(auxf["pictureHeader"][0].path)
          var encode_profilePic = profilePic.toString('base64');
          var encode_headerPic = headerPic.toString('base64');
          var objectAux = {
            firstName: aux.firstName,
            lastName: aux.lastName,
            studentNumber: aux.studentNumber,
            followers:[],
            following:[],
            profilePhoto:{
              filetype: auxf["pictureProfile"][0].mimetype,
              photo: new Buffer(encode_profilePic, 'base64')
            },
            bannerPhoto:{
              filetype: auxf["pictureHeader"][0].mimetype,
              photo: new Buffer(encode_headerPic, 'base64')
            },
            curso:{
              yearOfInscription: aux.yearOfInscription,
              yearOfConclusion: aux.yearOfConclusion,
              year: aux.year
            },
            lastAcess:today
          }
          axios.put(lhost+"/users/googleRegister/"+req.user.email, objectAux)
            .then(dados => res.redirect('/'))
            .catch(e => res.render('error', {error: e}))
            }
          })
      .catch(erro=>console.log(erro))   
  }
  else{
    res.render('register',{error:true});
  }
})


router.post('/register', upload.fields([{name:'pictureProfile', maxCount: 1},{name:'pictureHeader', maxCount: 1}]), function(req, res, next){
  aux = req.body
  auxf = req.files
  if( aux.email != "" && aux.firstName != "" && aux.lastName != "" && aux.studentNumber != "" && aux.firstName != ""
  && auxf["pictureProfile"][0].path != "" && auxf["pictureHeader"][0].path != "" && aux.year != "" && aux.yearOfInscription != ""){
    if(checkPwd(aux.password)){
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      _aux = re.test(aux.email)
      if(_aux){
        axios.get("http://localhost:3001/aux/checkEmail/"+aux.email)
          .then(data=>{
            if(data.data == true){
              res.render('register',{error:true});
            }
            else{
              axios.get("http://localhost:3001/aux/checkSN/"+aux.studentNumber)
                .then(data=>{
                  if(data.data == true){
                    res.render('register',{error:true});
                  }
                  else{
                    var today = new Date()
                    today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                    var hash = bcrypt.hashSync(aux.password, 10);
                    var profilePic = fs.readFileSync(auxf["pictureProfile"][0].path)
                    var headerPic = fs.readFileSync(auxf["pictureHeader"][0].path)
                    var encode_profilePic = profilePic.toString('base64');
                    var encode_headerPic = headerPic.toString('base64');
                    var objectAux = {
                      email: aux.email,
                      firstName: aux.firstName,
                      lastName: aux.lastName,
                      studentNumber: aux.studentNumber,
                      password: hash,
                      followers:[],
                      following:[],
                      profilePhoto:{
                        filetype: auxf["pictureProfile"][0].mimetype,
                        photo: new Buffer(encode_profilePic, 'base64')
                      },
                      bannerPhoto:{
                        filetype: auxf["pictureHeader"][0].mimetype,
                        photo: new Buffer(encode_headerPic, 'base64')
                      },
                      curso:{
                        yearOfInscription: aux.yearOfInscription,
                        yearOfConclusion: aux.yearOfConclusion,
                        year: aux.year
                      },
                      lastAcess:today
                    }
                  axios.post(lhost+"/users", objectAux)
                    .then(dados => res.redirect('../home'))
                    .catch(e => res.render('error', {error: e}))
                  }
                })
                .catch(erro=>console.log(erro))
            }
          })
          .catch(erro=>console.log(erro))
      }
    }
    else{
      res.render('register',{error:true});
    }
  }
  else{
    res.render('register',{error:true});
  }
})

function verificaAutenticacao(req,res,next){
  if(req.isAuthenticated()){
    next();
  } else{
    res.redirect("/home");}
}

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

function verificaAutenticacaoHome(req,res,next){
  if(req.isAuthenticated()){
    res.redirect("/");
  } else{
    next();}
}

function checkPwd(value){
  if(value == ""){
    return false
  }
  else if(value.length <= 6){
    return false
  }
  else{
    return true
  }
}

module.exports = router;
