
var db = require('./db')

module.exports = {
    get: get,
    clone: clone,
    set: set
}

var _world = [[]]

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

function set (newWorld) {
    _world = newWorld    
}
