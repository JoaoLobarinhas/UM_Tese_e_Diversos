var Publications = require('../models/publications')

module.exports.getPublicationOfUser = sn =>{
    return Publications.find({"owner.studentNumber":sn}).sort({'date': -1}).exec();
}

module.exports.getPublication = id =>{
    return Publications.find({_id:id}).exec()
}

module.exports.getComments = ids =>{
    return Publications.find({'_id': {'$in': ids}}).sort({'date': -1}).exec()
}

module.exports.feedPublications = following =>{
    console.log(following)
    return Publications.find({'owner.studentNumber': {'$in': following},'responseTo': {'$exists': false},}).sort({'date': -1}).exec()
}

module.exports.insert = data =>{
    var novo = new Publications(data)
    return novo.save()
}

module.exports.newComment = (idN,id)=>{
    return Publications.findOneAndUpdate({_id:idN}, {$push: {comments:id}})
  }

module.exports.userDataChanged = (studentNumber,data) =>{
    return Publications.updateMany({"owner.studentNumber":studentNumber},data)
}
