
var mongoose = require('mongoose')

//mongoose.connect('mongodb://dev:dev@ds061360.mongolab.com:61360/gameoflifemmo')

var db = mongoose.connection

db.on('error', function (err) {
    console.log('MONGODB ERROR', err)
})

db.once('open', function () {
    console.log('connected to DB.')
})

mongoose.exports = db
