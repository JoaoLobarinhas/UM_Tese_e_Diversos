const mongoose = require('mongoose')

var CursoSchema = new mongoose.Schema({
  yearOfInscription: { type: String, required: true },
  yearOfConclusion: { type: String},
  year:{ type: String, required: true }
},{ _id : false })

var PhotoSchema = new mongoose.Schema({
  filetype:{type: String, required: true},
  photo:{type: Buffer, required: true}
},{ _id : false })

var UsersSchema = new mongoose.Schema({
    email: { type: String, unique : true, required : true, dropDups: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    studentNumber: { type: String, lowercase: true, unique : true, dropDups: true },
    password: { type: String},
    curso: CursoSchema,
    googleId:{ type: String},
    followers: Array,
    following: Array,
    profilePhoto:PhotoSchema,
    bannerPhoto:PhotoSchema,
    lastAcess: String
  });

module.exports = mongoose.model('users', UsersSchema)