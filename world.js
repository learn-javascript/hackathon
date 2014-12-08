
var db = require('./db')

module.exports = {
    get: get,
    clone: clone,
    set: set,
    getParsed: getParsed
}

var _world = [[]]

var _parsedWorld = [[]]

function _loadWorld () {
    // db to-do
}

function clone () {
    return get().slice(0)
}

function save () {
    // db to-do
}

function get () {
    return _world
}

function getParsed () {
    return _parsedWorld
}

function set (newWorld) {
    _world = newWorld
    _parsedWorld = parseWorld(newWorld)
}

// from 170kb to 20kb on 100x100 world
function parseWorld (world) {
    var parsedWorld = [[]]
    for(var x=0; x<world.length; x++) {
        parsedWorld[x] = []
        for(var y=0; y<world.length; y++) {
            var tile = world[x][y]
            parsedWorld[x][y] = {
                vegetation: {
                    density: ~~tile.vegetation.density
                },
                entity: !!tile.entity,
                eventData : {
                    rain : tile.eventData.rain.active
                }
            }
        }
    }
    return parsedWorld
}