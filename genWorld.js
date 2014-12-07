
module.exports = function (width, height) {
    //todo: there are going to be dinosaurs on your dinosaur tour, right?
    var map = []
    for(var i = 0; i < width; i++) {
        map.push([])
        for(var j = 0; j < height; j++) {
            map[i].push(new Tile())
            //randomly generate density as well!
//            map[i][j].vegetation.density = (Math.floor(Math.random() * 100) % 5 > 0 ? 1 : 0)
            map[i][j].vegetation.density = (Math.floor(Math.random() * 100))
            map[i][j].entity.alive = (Math.floor(Math.random() * 100) % 100 < 31)
            if(map[i][j].entity.alive) {
                map[i][j].entity.hunger = Math.floor(Math.random() * 100) + 1
            }
        }
    }
//    map[1][1].entity.alive = true
//    map[1][2].entity.alive = true
//    map[2][1].entity.alive = true
//    map[2][2].entity.alive = true
    return map

}

function Entity() {
    this.type = "herbivore" //not sure this is needed anymore
    this.age = 0
    this.alive = false // Instead of alive, why dont we just remove it?

    this.hunger = 1 // determines how much an entity eats

    this.mass = Math.floor(Math.random() * 90 + 10)
    this.maxHealth = Math.floor(100 + (this.mass * .35)) // Loses health from being attack or w/e
    this.currentHealth = this.maxHealth
    this.maxDiet = this.currentDiet = Math.floor(this.mass * .35)
    this.dietLossPerTick = 2
    this.dietLossPerMove = 5
}

function Vegetation() {
    this.density
    this.growthRate
}
var uid = 0;
function Tile() {
    this.vegetation = new Vegetation()
    this.entity = new Entity()
    this.habitatNeighbors = 0
    this.livingNeighbors = 0
    this.domesticity = 0
    this.id = uid++;
}