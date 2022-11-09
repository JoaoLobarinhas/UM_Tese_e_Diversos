const mongoose = require('mongoose')

  var FileSchema = new mongoose.Schema({
    filetype:{type: String, required: true},
    filename: String,
    pubCont:{type: Buffer, required: true}
  },{ _id : false })
  
  var OwnerSchema = new mongoose.Schema({
    studentNumber:{ type: String, required : true},
    firstName:String,
    lastName:String,
    filetype:{type: String, required: true},
    photo:{type: Buffer, required: true}
  },{ _id : false })

  var publicSchema = new mongoose.Schema({
      owner: OwnerSchema,
      text:String,
      file:FileSchema,
      react: Array,
      comments:Array,
      responseTo:String,
      group:String,
      date: String
    });


module.exports = mongoose.model('publications', publicSchema)