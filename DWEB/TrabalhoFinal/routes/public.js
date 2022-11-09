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

router.get('/:id',verificaAutenticacao,function(req, res, next){
    axios.get(lhost+"/public/one/"+req.params.id)
        .then(data =>{
            const dados = data.data[0]
            console.log(dados._id)
            var base64 = _arrayBufferToBase64(dados.owner.photo.data)
            var src = "data:"+dados.owner.filetype+";base64,"+base64
            if(dados.file){
                filePublication64 = _arrayBufferToBase64(dados.file.pubCont.data)
                srcFile = "data:"+dados.file.filetype+";base64,"+filePublication64
                dados.file.pubCont=srcFile
                if(dados.file.filetype == "image/jpeg" || dados.file.filetype == "image/png" || dados.file.filetype == "image/gif"){
                  dados.file.image =true
                }
                else if(dados.file.filetype == "application/pdf"){
                    dados.file.pdf = true
                }
                else if(dados.file.filetype == "application/msword" || dados.file.filetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
                    dados.file.doc =true
                }
              }
            dados.owner.photo = src
            var aux = {
                comments: dados.comments
            }
            axios.post(lhost+"/public/comments/",aux)
                .then(public=>{
                    const publics = public.data
                    publics.forEach(element => {
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
                    res.render('publications',{og:dados,public:publics})
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
})

router.post('/',[verificaAutenticacao,upload.fields([{name:'files', maxCount: 1}])], function(req, res, next){
    const aux = req.body
    const files = req.files
    if(files["files"]){
        if(aux.text != "" && aux.text.length <=249 && files["files"][0].path != ""){
            axios.get(lhost+"/users/checkUser/"+req.user.email)
                .then(data =>{
                    var file = fs.readFileSync(files["files"][0].path)
                    var encode_file = file.toString('base64')
                    var today = new Date()
                    today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                    const dados = data.data
                    public = {
                        owner:{
                            studentNumber:dados.studentNumber,
                            firstName:dados.firstName,
                            lastName:dados.lastName,
                            filetype:dados.profilePhoto.filetype,
                            photo:dados.profilePhoto.photo
                        },
                        text: aux.text,
                        file:{
                            filetype:files["files"][0].mimetype,
                            filename:files["files"][0].originalname,
                            pubCont:new Buffer(encode_file, 'base64')
                        },
                        date:today
                    }
                    axios.post(lhost+"/public",public)
                    .then(dados => res.redirect('/'))
                    .catch(e => res.render('error', {error: e}))
                })
                .catch(e =>{
                    console.log(e)
                    res.status(500).jsonp(e)
                })
        }
    }
    else{
        if(aux.text != "" && aux.text.length <=249){
            axios.get(lhost+"/users/checkUser/"+req.user.email)
            .then(data =>{
                var today = new Date()
                today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                const dados = data.data
                public = {
                    owner:{
                        studentNumber:dados.studentNumber,
                        firstName:dados.firstName,
                        lastName:dados.lastName,
                        filetype:dados.profilePhoto.filetype,
                        photo:dados.profilePhoto.photo
                    },
                    text: aux.text,
                    date:today
                }
                axios.post(lhost+"/public",public)
                .then(dados => res.redirect('/'))
                .catch(e => res.render('error', {error: e}))
            })
            .catch(e =>{
                console.log(e)
                res.status(500).jsonp(e)
            })
        }
    }
})

router.post('/comment/:id',[verificaAutenticacao,upload.fields([{name:'files', maxCount: 1}])], function(req, res, next){
    const aux = req.body
    const files = req.files
    const idOrigin = req.params.id
    if(files["files"]){
        if(aux.text != "" && aux.text.length <=249 && files["files"][0].path != ""){
            axios.get(lhost+"/users/checkUser/"+req.user.email)
                .then(data =>{
                    var file = fs.readFileSync(files["files"][0].path)
                    var encode_file = file.toString('base64')
                    var today = new Date()
                    today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                    const dados = data.data
                    public = {
                        owner:{
                            studentNumber:dados.studentNumber,
                            firstName:dados.firstName,
                            lastName:dados.lastName,
                            filetype:dados.profilePhoto.filetype,
                            photo:dados.profilePhoto.photo
                        },
                        responseTo:idOrigin,
                        text: aux.text,
                        file:{
                            filetype:files["files"][0].mimetype,
                            filename:files["files"][0].originalname,
                            pubCont:new Buffer(encode_file, 'base64')
                        },
                        date:today
                    }
                    axios.post(lhost+"/public",public)
                    .then(dados =>{
                        console.log(dados.data._id)
                        var newId = {
                            id:dados.data._id
                        }
                        axios.put(lhost+"/public/"+idOrigin,newId)
                            .then(data =>{
                                res.redirect("/")
                                // res.redirect("/public/"+newId)
                            })
                            .catch(e => res.render('error', {error: e}))
                    })
                    .catch(e => res.render('error', {error: e}))
                })
                .catch(e =>{
                    console.log(e)
                    res.status(500).jsonp(e)
                })
        }
    }
    else{
        if(aux.text != "" && aux.text.length <=249){
            axios.get(lhost+"/users/checkUser/"+req.user.email)
            .then(data =>{
                var today = new Date()
                today = dateFormat(today, 'dd-mm-yyyy HH:MM:ss')
                const dados = data.data
                public = {
                    owner:{
                        studentNumber:dados.studentNumber,
                        firstName:dados.firstName,
                        lastName:dados.lastName,
                        filetype:dados.profilePhoto.filetype,
                        photo:dados.profilePhoto.photo
                    },
                    responseTo:idOrigin,
                    text: aux.text,
                    date:today
                }
                axios.post(lhost+"/public",public)
                    .then(dados =>{
                        console.log(dados.data._id)
                        var newId = {
                            id:dados.data._id
                        }
                        axios.put(lhost+"/public/"+idOrigin,newId)
                            .then(data =>{
                                res.redirect("/")
                                // res.redirect("/public/"+newId)
                            })
                            .catch(e => res.render('error', {error: e}))
                    })
                    .catch(e => res.render('error', {error: e}))
            })
            .catch(e =>{
                console.log(e)
                res.status(500).jsonp(e)
            })
        }
    }
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
  