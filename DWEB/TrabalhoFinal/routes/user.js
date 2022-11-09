var express = require('express');
var router = express.Router();
var axios = require('axios');
var passport = require('passport')
var lhost = require('../config/env').host
var thisHost = require('../config/env').lhost
const fs = require('fs')
var dateFormat = require('dateformat');
var multer = require('multer')
var upload = multer({dest:'uploads/'})

router.get('/', verificaAutenticacao,function(req, res, next) {
  axios.get(lhost+"/users/getCurrentProfile/"+req.user.email)
    .then(dados =>{
      const datas = dados.data[0]
      axios.get(lhost+"/users/photos/"+datas.studentNumber)
        .then(dados =>{
          const images = dados.data
          base64img = _arrayBufferToBase64(images.profilePhoto.photo.data)
          srcProfile = "data:"+images.profilePhoto.filetype+";base64,"+base64img
          base64img = _arrayBufferToBase64(images.bannerPhoto.photo.data)
          srcHeader = "data:"+images.bannerPhoto.filetype+";base64,"+base64img
          axios.get(lhost+"/public/"+datas.studentNumber)
            .then(public =>{
              const publics = public.data
              publics.forEach(element => {
                console.log(element.owner)
                base64img = _arrayBufferToBase64(element.owner.photo.data)
                srcProfileF = "data:"+element.owner.filetype+";base64,"+base64img
                element.owner.photo = srcProfileF
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
              res.render('ownProfile',{data:datas,profilePic:srcProfile,headerPic:srcHeader,public:publics})
            })
            .catch(e =>{
              console.log(e)
              res.render('error',{message:e})})
        })
        .catch(e =>{
          console.log(e)
          res.render('error',{message:e})})
    })
    .catch(e => {
      console.log(e)
      res.render('error',{message:e})})
});

router.get('/:sn', verificaAutenticacao, function(req, res, next) {
  const sn = req.params.sn
  axios.get(lhost+"/users/getUserProfile/"+sn)
    .then(dados =>{
      const datas = dados.data[0]
      axios.get(lhost+"/users/photos/"+datas.studentNumber)
        .then(dados =>{
          const images = dados.data
          base64img = _arrayBufferToBase64(images.profilePhoto.photo.data)
          srcProfile = "data:"+images.profilePhoto.filetype+";base64,"+base64img
          base64img = _arrayBufferToBase64(images.bannerPhoto.photo.data)
          srcHeader = "data:"+images.bannerPhoto.filetype+";base64,"+base64img
          if(datas.email == req.user.email){
            res.redirect('/user/')
          }
          else{
            axios.get(lhost+"/users/following/"+req.user.email+"?sn="+sn)
              .then(dados =>{
                var auxFollow = dados.data
                axios.get(lhost+"/public/"+datas.studentNumber)
                .then(public =>{
                  const publics = public.data
                  publics.forEach(element => {
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
                    element.owner.photo = srcProfile
                  });
                  if(auxFollow){
                    res.render('profile',{data:datas,profilePic:srcProfile,headerPic:srcHeader,public:publics,following:true})
                  }
                  else{
                    res.render('profile',{data:datas,profilePic:srcProfile,headerPic:srcHeader,public:publics})
                  }
                })
              })
              .catch(e =>{
                console.log(e)
                res.render('error',{message:e})})
          }
        })
        .catch(e =>{
          console.log(e)
          res.render('error',{message:e})})
    })
    .catch(e => {
      console.log(e)
      res.render('error',{message:"User not found"})})
});

router.post('/search', verificaAutenticacao, function(req, res, next){
  console.log(req.body.search)
  res.redirect('/user/'+req.body.search)
})

router.post('/followUser', verificaAutenticacao, function(req, res, next){
  const sn = req.body.studentNumber
  axios.get(lhost+"/users/following/"+req.user.email+"?sn="+sn)
    .then(dados =>{
      if(dados){
        if(dados.data){
          axios.put(lhost+"/users/stopFollow/"+req.user.email+"?sn="+sn)
            .then(dados =>{
              axios.put(lhost+"/users/unfollowed/"+req.user.email+"?sn="+sn)
                .then(dados =>{
                  res.redirect('/user/'+sn)
                })
                .catch(e =>{
                  console.log(e)
                  res.status(500).jsonp(e)
                })
            })
            .catch(e =>{
              console.log(e)
              res.status(500).jsonp(e)
            })
        }
        else{
          axios.put(lhost+"/users/follow/"+req.user.email+"?sn="+sn)
          .then(dados =>{
            axios.put(lhost+"/users/followed/"+req.user.email+"?sn="+sn)
              .then(dados =>{
                res.redirect('/user/'+sn)
              })
              .catch(e =>{
                console.log(e)
                res.status(500).jsonp(e)
              })
          })
          .catch(e =>{
            console.log(e)
            res.status(500).jsonp(e)
          })
        }
      }
    })
    .catch(e => res.status(500).jsonp(e))
})

router.post('/updateUser',[verificaAutenticacao,upload.fields([{name:'pictureProfile', maxCount: 1},{name:'pictureHeader', maxCount: 1}])], function(req, res, next) {
  const aux = req.body
  const files = req.files
  axios.get(lhost+"/users/checkUser/"+req.user.email)
    .then(data =>{
      const oldProfilePic = data.data.profilePhoto
      const oldSN = data.data.studentNumber
      if(files["pictureProfile"] && files["pictureHeader"]){
        if(aux.firstName != "" && aux.lastName != "" && aux.studentNumber != "" && files["pictureProfile"][0].path != "" && files["pictureHeader"][0].path != "" && aux.year != "" && aux.yearOfInscription != ""){
          axios.get(lhost+"/users/"+aux.studentNumber)
          .then(dados =>{
              var same = false
              const data = dados.data
              if(data){
                if(data.email == req.user.email){
                  same=true
                }
                else{
                  res.redirect('/user')
                }
              }
              else{
                same=true
              }
              if(same){
                var today = new Date()
                today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                var profilePic = fs.readFileSync(files["pictureProfile"][0].path)
                var headerPic = fs.readFileSync(files["pictureHeader"][0].path)
                var encode_profilePic = profilePic.toString('base64');
                var encode_headerPic = headerPic.toString('base64');
                var objectAux = {
                  firstName: aux.firstName,
                  lastName: aux.lastName,
                  studentNumber: aux.studentNumber,
                  profilePhoto:{
                    filetype: files["pictureProfile"][0].mimetype,
                    photo: new Buffer(encode_profilePic, 'base64')
                  },
                  bannerPhoto:{
                    filetype: files["pictureHeader"][0].mimetype,
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
                .then(dados =>{
                  var update ={
                    owner:{
                      studentNumber:aux.studentNumber,
                      firstName:aux.firstName,
                      lastName:aux.lastName,
                      filetype:files["pictureProfile"][0].mimetype,
                      photo: new Buffer(encode_profilePic, 'base64')
                    }
                  }
                  axios.put(lhost+"/public/user/"+oldSN,update)
                      .then(dados => res.redirect('/'))
                      .catch(e => res.render('error', {error: e}))
                })
                .catch(e => res.render('error', {error: e}))
              }
            })
          .catch(e => res.status(500).jsonp(e))
        }
      }
      else if(files["pictureProfile"]){
        if(aux.firstName != "" && aux.lastName != "" && aux.studentNumber != "" && files["pictureProfile"][0].path != "" && aux.year != "" && aux.yearOfInscription != ""){
          axios.get(lhost+"/users/"+aux.studentNumber)
          .then(dados =>{
              var same = false
              const data = dados.data
              if(data){
                if(data.email == req.user.email){
                  same=true
                }
                else{
                  res.redirect('/user')
                }
              }
              else{
                same=true
              }
              if(same){
                var today = new Date()
                today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                var profilePic = fs.readFileSync(files["pictureProfile"][0].path)
                var encode_profilePic = profilePic.toString('base64');
                var objectAux = {
                  firstName: aux.firstName,
                  lastName: aux.lastName,
                  studentNumber: aux.studentNumber,
                  profilePhoto:{
                    filetype: files["pictureProfile"][0].mimetype,
                    photo: new Buffer(encode_profilePic, 'base64')
                  },
                  curso:{
                    yearOfInscription: aux.yearOfInscription,
                    yearOfConclusion: aux.yearOfConclusion,
                    year: aux.year
                  },
                  lastAcess:today
                }
                axios.put(lhost+"/users/googleRegister/"+req.user.email, objectAux)
                .then(dados =>{
                  var update ={
                    owner:{
                      studentNumber:aux.studentNumber,
                      firstName:aux.firstName,
                      lastName:aux.lastName,
                      filetype:files["pictureProfile"][0].mimetype,
                      photo: new Buffer(encode_profilePic, 'base64')
                    }
                  }
                  axios.put(lhost+"/public/user/"+oldSN,update)
                      .then(dados => res.redirect('/'))
                      .catch(e => res.render('error', {error: e}))
                })
                .catch(e => res.render('error', {error: e}))
              }
            })
          .catch(e => res.status(500).jsonp(e))
        }
      }
      else if(files["pictureHeader"]){
        if(aux.firstName != "" && aux.lastName != "" && aux.studentNumber != "" && files["pictureHeader"][0].path != "" && aux.year != "" && aux.yearOfInscription != ""){
          axios.get(lhost+"/users/"+aux.studentNumber)
          .then(dados =>{
              var same = false
              const data = dados.data
              if(data){
                if(data.email == req.user.email){
                  same=true
                }
                else{
                  res.redirect('/user')
                }
              }
              else{
                same=true
              }
              if(same){
                var today = new Date()
                today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                var headerPic = fs.readFileSync(files["pictureHeader"][0].path)
                var encode_headerPic = headerPic.toString('base64');
                var objectAux = {
                  firstName: aux.firstName,
                  lastName: aux.lastName,
                  studentNumber: aux.studentNumber,
                  bannerPhoto:{
                    filetype: files["pictureHeader"][0].mimetype,
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
                .then(dados =>{
                  var update ={
                    owner:{
                      studentNumber:aux.studentNumber,
                      firstName:aux.firstName,
                      lastName:aux.lastName,
                      filetype:oldProfilePic.filetype,
                      photo: oldProfilePic.photo
                    }
                  }
                  axios.put(lhost+"/public/user/"+oldSN,update)
                      .then(dados => res.redirect('/'))
                      .catch(e => res.render('error', {error: e}))
                })
                .catch(e => res.render('error', {error: e}))
              }
            })
          .catch(e => res.status(500).jsonp(e))
        }
      }
      else{
        if(aux.firstName != "" && aux.lastName != "" && aux.studentNumber != "" && aux.year != "" && aux.yearOfInscription != ""){
          console.log(1)
          axios.get(lhost+"/users/"+aux.studentNumber)
          .then(dados =>{
            console.log(req.user.email)
              var same = false
              const data = dados.data
              if(data){
                if(data.email == req.user.email){
                  same=true
                }
                else{
                  res.redirect('/user')
                }
              }
              else{
                same=true
              }
              if(same){
                var today = new Date()
                today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                var objectAux = {
                  firstName: aux.firstName,
                  lastName: aux.lastName,
                  studentNumber: aux.studentNumber,
                  curso:{
                    yearOfInscription: aux.yearOfInscription,
                    yearOfConclusion: aux.yearOfConclusion,
                    year: aux.year
                  },
                  lastAcess:today
                }
                axios.put(lhost+"/users/googleRegister/"+req.user.email, objectAux)
                .then(dados =>{
                  var update ={
                    owner:{
                      studentNumber:aux.studentNumber,
                      firstName:aux.firstName,
                      lastName:aux.lastName,
                      filetype:oldProfilePic.filetype,
                      photo: oldProfilePic.photo
                    }
                  }
                  axios.put(lhost+"/public/user/"+oldSN,update)
                      .then(dados => res.redirect('/'))
                      .catch(e => res.render('error', {error: e}))
                })
                  .catch(e =>{
                    console.log(e)
                    res.render('error', {error: e})
                  })
              }
            })
          .catch(e => res.status(500).jsonp(e))
        }
      }
    })
    .catch(e =>{
      console.log(e)
      res.render('error', {error: e})
    })
})

function verificaAutenticacao(req,res,next){
    if(req.isAuthenticated()){
      next();
    } else{
      res.redirect(thisHost+"/home");}
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

module.exports = router;