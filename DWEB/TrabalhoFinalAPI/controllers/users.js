var Users = require('../models/users')

module.exports.listar = () => {
    return Users
        .find()
        .exec()
}

module.exports.loginUser = (email) =>{
    return Users.findOne({email:email},{_id:0,email:1,password:1}).exec()
}

module.exports.checkUser = (email) =>{
    return Users.findOne({email:email},{_id:0,password:0}).exec()
}

module.exports.getUser = (studentNumber) =>{
    return Users.findOne({studentNumber:studentNumber},{_id:0,password:0}).exec()
}

module.exports.getStudentNumber = (email) =>{
  return Users.findOne({email:email},{_id:0,studentNumber:1}).exec()
}

module.exports.checkSN = studentNumber => {
    return Users.exists({studentNumber:studentNumber})  
}

module.exports.loginGoogle = (email) =>{
    return Users.findOne({email:email},{_id:0,email:1,googleId:1}).exec()
} 

module.exports.updateGoogleAccount = (email,body) =>{
    return Users.findOneAndUpdate({email:email},body).exec()
}

module.exports.checkIfFollow = (email,sn)=>{
  return Users.exists({email:email,following:sn})
}

//1 - Conta A -> Segue -> Conta B
module.exports.startFollow = (email,sn)=>{
  return Users.findOneAndUpdate({email:email}, {$push: {following:sn}})
}

//1 Conta B -> foi seguida -> Conta A
module.exports.getFollowed = (sn,snF)=>{
  return Users.findOneAndUpdate({studentNumber:sn}, {$push: {followers:snF}})
}

//2 - Conta A -> deixou de Seguir -> Conta B
module.exports.stopFollow = (email,sn)=>{
  return Users.findOneAndUpdate({email:email}, {$pull: {following:sn}})
}

//2 Conta B -> levou Unfollow -> Conta A
module.exports.unFollowed = (sn,snF)=>{
  return Users.findOneAndUpdate({studentNumber:sn}, {$pull: {followers:snF}})
}

module.exports.checkEmail = email => {
    return Users.exists({email:email})
}

module.exports.checkEmailAndSn = (email,sn) => {
  return Users.exists({email:email,studentNumber:sn})
}

module.exports.checkEmailAndSn = (email,sn) => {
  return Users.exists({email:email,studentNumber:sn})
}

module.exports.getUserProfile = sn =>{
    return Users.aggregate([
        {
          '$match': {
            'studentNumber': sn
          }
        }, {
          '$project': {
            'firstName': 1, 
            'lastName': 1, 
            'email': 1, 
            'curso': 1, 
            'lastAcess': 1, 
            'studentNumber': 1,
            'followers': {
              '$cond': {
                'if': {
                  '$isArray': '$followers'
                }, 
                'then': {
                  '$size': '$followers'
                }, 
                'else': 'NA'
              }
            }, 
            'following': {
              '$cond': {
                'if': {
                  '$isArray': '$following'
                }, 
                'then': {
                  '$size': '$following'
                }, 
                'else': 'NA'
              }
            }
          }
        }
      ]).exec()
}

module.exports.getCurrentUser = (email) =>{
  return Users.aggregate([
    {
      '$match': {
        'email': email
      }
    }, {
      '$project': {
        'firstName': 1, 
        'lastName': 1, 
        'email': 1, 
        'curso': 1, 
        'lastAcess': 1, 
        'studentNumber': 1,
        'followers': {
          '$cond': {
            'if': {
              '$isArray': '$followers'
            }, 
            'then': {
              '$size': '$followers'
            }, 
            'else': 'NA'
          }
        }, 
        'following': {
          '$cond': {
            'if': {
              '$isArray': '$following'
            }, 
            'then': {
              '$size': '$following'
            }, 
            'else': 'NA'
          }
        }
      }
    }
  ]).exec()
}

module.exports.getUserProfilePics = sn =>{
  return Users.findOne({studentNumber:sn},{_id:0,bannerPhoto:1,profilePhoto:1}).exec()
}

module.exports.getUserPic = email =>{
  return Users.findOne({email:email},{_id:0,profilePhoto:1}).exec()
}

module.exports.insert = u => {
    var novo = new Users(u)
    return novo.save()
}