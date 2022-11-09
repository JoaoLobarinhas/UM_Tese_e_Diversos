var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon')
var cors = require('cors');
const paginate = require('express-paginate');

// Módulos de suporte à autenticação
var uuid = require('uuid/v4');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var axios = require('axios');
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
//-----------------------------------

axios.interceptors.request.use(function (config) {
  const token = genToken()
  config.headers.Authorization = 'Bearer '+ token;
  return config;
});

// Configuração da estratégia local
passport.use(new LocalStrategy(
  {usernameField: 'email',passwordField: 'password'}, (email, password, done) => {
  axios.get('http://localhost:3005/users/login/' + email)
    .then(dados => {
      var user = dados.data
      if(!user) { return done(null, false, {message: 'Utilizador inexistente!\n'})}
      if(!bcrypt.compareSync(password, user.password)) { return done(null, false, {message: 'Password inválida!\n'})}
      return done(null, user)
  })
  .catch(erro => done(erro))
}));

passport.use(new GoogleStrategy({
  clientID: "",
  clientSecret: '',
  callbackURL: "http://127.0.0.1:3001/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    axios.get('http://localhost:3005/users/googleLogin/'+profile.emails[0].value)
      .then(dados=>{
        var user = dados.data
        if(!user){
          var userAux={
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            googleId: profile.id
          }
          axios.post("http://localhost:3005/users/",userAux)
            .then(dados=>{
              var meme={email:profile.emails[0].value}
              return done(null, meme)
            })
            .catch(erro => done(erro))
        }
        else{
          if(!user.googleId){
            return done(null, false,{message: 'Utilizador existente!\n'})
          }
          else{
            var meme={email:profile.emails[0].value}
            return done(null, meme)
          }
        }
      })
      .catch(erro => done(erro))
  }
));

// Indica-se ao passport como serializar o utilizador
passport.serializeUser((user,done) => {
  console.log('Vou serializar o user: ' + user.email)
  // Serialização do utilizador. O passport grava o utilizador na sessão aqui.
  done(null, user.email)
});
  
// Desserialização: a partir do id obtem-se a informação do utilizador
passport.deserializeUser((email, done) => {
  
  console.log('Vou desserializar o utilizador: ' + email)
  axios.get('http://localhost:3005/users/login/' + email)
    .then(dados => done(null, dados.data))
    .catch(erro => done(erro, false))
})

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var auxRouter = require('./routes/auxs');
var publicRouter = require('./routes/public');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: false,limit: '5mb', parameterLimit: 10000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
app.use('/jquery', express.static(path.join(__dirname + '/node_modules/jquery/dist')));
app.use('/popper', express.static(path.join(__dirname + '/node_modules/popper.js/dist')));
app.use('/jsBootstrap', express.static(path.join(__dirname + '/node_modules/bootstrap/dist/js')));
app.use('/css', express.static(path.join(__dirname + '/node_modules/bootstrap/dist/css')));
app.use('/material', express.static(path.join(__dirname + '/node_modules/material-icons/iconfont')));
app.use('/axios', express.static(path.join(__dirname + '/node_modules/axios/dist')));

app.use(session({
  genid: req => {
    console.log('Dentro do middleware da sessão...')
    console.log(req.sessionID)
    return uuid()
  },
  store: new FileStore(),
  secret: 'dwebTrabF',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use('/', indexRouter);
app.use('/aux', auxRouter);
app.use(paginate.middleware(10, 50));
app.use('/user', userRouter);
app.use('/public', publicRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

function genToken(){
  var token = jwt.sign({},'dwebF',{
    expiresIn:300,
    issuer:"Servidor TrabalhoFinal"
  })
  return token
}
