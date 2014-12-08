
var world = require('./world')
var genWorld = require('./genWorld')
var GameUtil = require('./gameUtil')
var Entity = require('./entity')
var WorldEvents = require('./worldEvents')
var RainEvent = WorldEvents.RainEvent

var game = {}


module.exports = {
    tick: tick,
    action: action,
    addEntity: addEntity
}

var addEntityQueu = []

// init world
game.world = genWorld(100, 100)
world.set(game.world)

function tick (done) {
    
    // var startTimer = (new Date).getTime()

    game.world = world.clone()

    game.tick()

    while(addEntityQueu.length>0){
        var pos = addEntityQueu.pop()
        game.world[pos.y][pos.x].entity = new Entity()
    }

    // done doing things
    world.set(game.world)
    done()
    
    // console.log((new Date).getTime() - startTimer + ' ms')
}

function action (action) {
    //to-do
}

function addEntity (x, y) {
    addEntityQueu.push({x:x, y:y})
}

function cacheNeighbors(){
    var neighborCache = GameUtil.create2dArray(20,20);
    GameUtil.forEach2d(game.world, function(tile, x , y){
        neighborCache[y][x] = GameUtil.getNeighbors(game.world,x,y);
        if(tile.id === 0){
            neighborCache[y][x].forEach(function(n){
                console.log(n.id);
            })
        }
    });
    return neighborCache;
}
game.neighbors = cacheNeighbors();

function handleAi(tile){
    if(!tile) return;

}

game.tick = function() {
    this.worldEvents.tick()
    for(var y = 0; y < game.world.length; y++) {
        for(var x = 0; x < game.world[y].length; x++) {
            var tile = game.world[y][x];
            tile.livingNeighbors = 0
            tile.habitatNeighbors = 0
            game.neighbors[y][x].forEach(function(t){
                if(t.entity) {
                    tile.livingNeighbors++
                }
                if(t.vegetation.density > 0) {
                    tile.habitatNeighbors++
                }
            });
            //generit tile processing
            if(tile.entity) {
                tile.entity.age++
                tile.domesticity++
                tile.entity.hunger-- // tile.entity.age * 5
                tile.vegetation.density -= Math.floor((Math.random() * tile.domesticity)) + 1 
            } else {
                tile.domesticity = Math.max(tile.domesticity - 1,0)
            }
            
            //entity logic stuff
            if(tile.entity && tile.entity.hunger < 1) {
                tile.entity = false
            }  else if(tile.entity) { //entity isn't dead it can either move or eat
                if(Math.pow(100 - tile.entity.hunger, 2) / 100 >= Math.pow(Math.floor(Math.random() * 100) + 1,2) / 100) { //if hunger theshhold is crossed
                    var volume = Math.min(Math.floor((Math.random() * (100 - tile.entity.hunger))) + 1,tile.vegetation.density)
                    tile.entity.hunger += volume
                    tile.vegetation.density -= volume
                } else if(tile.vegetation.density < game.getHabitatDensity(y,x)) {
                    var bestNeighbor = game.neighbors[y][x].reduce(function(p,c,i,arr) {
                        return p.vegetation.density > c.vegetation.density || c.entity ? p : c
                    },tile)
                                        
                    if(bestNeighbor != tile) {
                        bestNeighbor.entity = tile.entity
                        tile.entity = false
                    }
                } else if(tile.livingNeighbors > 3) {
                    tile.enitty = false
                } else if(tile.livingNeighbors == 3 && tile.entity.hunger > 50) {
                    var target = game.neighbors[y][x].reduce(function(p,c,i,arr) {
                        return p.vegetation.density > c.vegetation.density || c.entity ? p : c
                    },tile)
                    
                    if(target != tile) {
                        target.entity = new Entity()
                        target.entity.hunger = 50
                        tile.entity.hunger = Math.max(tile.entity.hunger - 50, 0)
                        if(tile.entity.hunger < 1) {
                            tile.entity.hunger = false
                        }
                    }
                }
            }

            //vegetation stuff is seperate from entity stuff?
            if(!tile.entity) {
                if(tile.domesticity === 0 && tile.vegetation.habitatNeighbors > 5 && tile.vegetation.density > game.getHabitatDensity(y,x)) {
                    tile.domesticity-= Math.floor(game.getHabitatDensity % tile.habitatNeighbors)
                } else if(tile.domesticity === 0 && tile.vegetation.habitatNeighbors > 5 && tile.vegetation.density <= game.getHabitatDensity(y,x)) {
                    tile.domesticity++
                }else if(tile.domesticity === 0 && tile.vegetation.habitatNeighbors > 5 && tile.vegetation.desnity === 0) {
                    tile.domesticity++
                } else if(tile.domesticity === 0) {
                    tile.vegetation.density++
                } else if(tile.domesticity > 0) {
                    tile.vegetation.density -= Math.floor(Math.random() * tile.domesticity) + 1
                }
            }

            tile.vegetation.density = Math.floor((Math.random() * 10)) + tile.vegetation.density - 5
            tile.vegetation.density = tile.vegetation.density > 100 ? 100 : tile.vegetation.density
            tile.vegetation.density = tile.vegetation.density < 0 ? 0 : tile.vegetation.density
        }
    }
}

game.changeVector = function(vector) {


    vector.x = Math.floor(Math.random() * 3) - 1
    vector.y = vector.x === 0 ? Math.floor(Math.random() * 3) - 1 : 0


    return vector
}

game.createEvent = function(){
    
}
game.countLivingNeighbors = function(y,x) {
    var livingNeighbors = 0
    for(var yIter = y - 1; yIter <= y + 1; yIter++) {
        for(var xIter = x - 1; xIter <= x + 1; xIter++) {
            if((xIter != x || yIter != y) && xIter >= 0 && yIter >= 0 && game.world[yIter] && game.world[yIter][xIter] && game.world[yIter][xIter].entity.alive) {
                livingNeighbors++
            }
        }
    }
    return livingNeighbors
}

game.countHabitatNeighbors = function(y,x) {
    var habitatNeighbors = 0
    for(var yIter = y - 1; yIter <= y + 1; yIter++) {
        for(var xIter = x - 1; xIter <= x + 1; xIter++) {
            if((xIter != x || yIter != y) && xIter >= 0 && yIter >= 0 && game.world[yIter] && game.world[yIter][xIter] && game.world[yIter][xIter].vegetation.density > 0) {
                habitatNeighbors++
            }
        }
    }
    return habitatNeighbors
}

game.getHabitatDensity = function(y,x) {
    var habitatDensity = 0
    var neighbors = 0
    for(var yIter = y - 1; yIter <= y + 1; yIter++) {
        for(var xIter = x - 1; xIter <= x + 1; xIter++) {
            if(xIter >= 0 && yIter >= 0 && game.world[yIter] && game.world[yIter][xIter]) {
                habitatDensity += game.world[yIter][xIter].vegetation.density
                neighbors++
            }
        }
    }
    return Math.round(habitatDensity / neighbors)
}

game.worldEvents = new WorldEvents.WorldEvents(game)
var re = new RainEvent(game)
game.worldEvents.add(re)