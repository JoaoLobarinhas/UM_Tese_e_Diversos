var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

//ADD ONS
mongoose.connect('mongodb://127.0.0.1:27017/DwebTrabF', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=> console.log('Servidor Mongo da API a correr...'))
  .catch((erro)=> console.log('Mongo: erro na conexão: ' + erro))

// Autenticação com JWT
var passport = require('passport')
var JWTStrategy = require('passport-jwt').Strategy
var ExtractJWT = require('passport-jwt').ExtractJwt

var extractFromQS = function(req){
  var token = null
  if(req.query && req.query.token ) token = req.query.token
  return token
}

var extractFromHeader = function(req){
  var token = null
  token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  return token
}

passport.use(new JWTStrategy({
  secretOrKey:"dwebF",
  jwtFromRequest: ExtractJWT.fromExtractors([extractFromQS,extractFromHeader])
}, async(payload, done)=>{
  try{
    return done(null, payload)
  }
  catch{
    return done(erro)
  } 
}))

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notifiRouter = require('./routes/notifications');
var publicRouter = require('./routes/publications');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: false,limit: '5mb', parameterLimit: 10000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/notifi', notifiRouter)
app.use('/users', usersRouter);
app.use('/public', publicRouter);
app.use('/', indexRouter);

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
