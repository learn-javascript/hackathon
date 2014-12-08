var Entity = require('./entity')
module.exports = function (width, height) {
    //todo: there are going to be dinosaurs on your dinosaur tour, right?
    var map = []
    for(var i = 0; i < width; i++) {
        map.push([])
        for(var j = 0; j < height; j++) {
            map[i].push(new Tile())
            map[i][j].x = j
            map[i][j].y = i
            //randomly generate density as well!
            map[i][j].vegetation.density = (Math.floor(Math.random() * 100))
            if(Math.floor(Math.random() * 100) % 100 < 15) {
                map[i][j].entity = new Entity()
                map[i][j].entity.hunger = Math.floor(Math.random() * 100) + 1
            }
        }
    }
    return map
}

function Vegetation() {
    this.density
    this.growthRate
}
var uid = 0;
function Tile() {
    this.vegetation = new Vegetation()
//    this.entity = new Entity()
    this.habitatNeighbors = 0
    this.livingNeighbors = 0
    this.domesticity = 0
    this.id = uid++;
    this.eventData = {
        rain : {power : 0, active : false}
    }
}