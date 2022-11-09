var Notifi = require('../models/notifications')

module.exports.addNotification = (data) =>{
    var novo = new Notifi(data)
    return novo.save()
}

module.exports.getTopNofications = (sn) =>{
    Notifi.find({followedSN:sn}).sort({'date': -1}).limit(5).exec();
}

module.exports.getNofications = (sn) =>{
    Notifi.find({followedSN:sn}).sort({'date': -1}).exec();
}