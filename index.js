
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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
app.use(express.static(__dirname + '/client'))
server.listen(process.argv[2] || process.env.PORT || 3000)

io.on('connection', function (socket) {

    if(isLooping === false) update()
    console.log('socket connected.')

    socket.on('chat', function (data) {
        if(data.msg && data.nick) {
            io.emit('chat', {msg: data.msg, nick: data.nick})
        }
    })

    socket.on('addEntity', function (data) {
        game.game.addEntity(data.x, data.y)
    })

})

function update(){
    isLooping = true
    game.tick(function(){
        var w = world.getParsed();
        app.set('tick', w)
    });
    setTimeout(update, 1000);
}

app.route('/update')
.get(function(req, res) {
    res.send(app.get('tick'))
})