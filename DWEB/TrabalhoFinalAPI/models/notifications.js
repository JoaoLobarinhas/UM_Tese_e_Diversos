const mongoose = require('mongoose')

var NotificationSchema = new mongoose.Schema({
    followedSN: { type: String, required: true },
    followerSN: { type: String, required: true },
    message:{ type: String, required: true },
    date:{ type: String, required: true }
  }, { capped: { size: 1024, max: 1000}});


module.exports = mongoose.model('notifications', NotificationSchema)