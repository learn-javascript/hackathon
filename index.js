
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

var game = require('./game')
var world = require('./world')
var compression = require('compression');

var isLooping = false

app.use(compression({
    threshold : 512
}))
app.use(express.static(__dirname + '/client'))
server.listen(process.argv[2] || process.env.PORT || 3000)

io.on('connection', function (socket) {

  if(isLooping === false) update()
  console.log('socket connected.')
  //commented out for better game debug
  //socket.emit('tick', world.get())
})

function update(){
   game.tick(function(){
       var w = world.get();
       
       app.set('tick', w)
   });
   setTimeout(update, 1000);
}

app.route('/update')
.get(function(req, res) {
    res.send(app.get('tick'))
})