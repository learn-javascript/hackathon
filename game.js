
var world = require('./world')
var genWorld = require('./genWorld')
var GameUtil = require('./gameUtil')
var Entity = require('./entity')

var game = {}

module.exports = {
    tick: tick,
    action: action
}

// init world
game.world = genWorld(100, 100)
world.set(game.world)

function tick (done) {
    
    // var startTimer = (new Date).getTime()

    game.world = world.clone()

    game.tick()

    // done doing things
    world.set(game.world)
    done()
    
    // console.log((new Date).getTime() - startTimer + ' ms')
}

function action (action) {
    //to-do
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
    for(var y = 0; y < game.world.length; y++) {
        for(var x = 0; x < game.world[y].length; x++) {
            var tile = game.world[y][x];
            tile.livingNeighbors = 0
            tile.habitatNeighbors = 0
            game.neighbors[y][x].forEach(function(t){
                if(t.entity) {
                    tile.livingNeighbors++
//                    t.entity.age++
                } else {
                    tile.domesticity = Math.max(tile.domesticity - 1,0)
                }
                if(t.vegetation.density > 0) {
                    tile.habitatNeighbors++
                }
            });
            if(tile.entity) {
                tile.entity.age++
                tile.domesticity++
                tile.entity.hunger-- // tile.entity.age * 5
                tile.vegetation.density -= Math.floor((Math.random() * tile.domesticity)) + 1 
            } 
            
            if(tile.entity && tile.entity.hunger < 1) {
                tile.entity = false
            }
            if(tile.entity && Math.pow(100 - tile.entity.hunger, 2) / 100 >= Math.pow(Math.floor(Math.random() * 100) + 1)) {
                    var volume = Math.min(Math.floor((Math.random() * (100 - tile.entity.hunger))) + 1,tile.vegetation.density)
                    tile.entity.hunger += volume
                    tile.vegetation.density -= volume
            }  
            
            //vegetation stuff is seperate from entity stuff?
            if(tile.domesticity === 0) {
                tile.vegetation.density++
            }
/**
            if(tile.deomesticity === 0 && tile.vegetation.habitatNeighbors > 5 && tile.vegetation.density > game.getHabitatDensity(y,x)) {
               tile.vegetation.density -= game.getHabitatDensity % tile.habitatNeighbors
            } else if(tile.domesticity === 0 && tile.vegetation.habitatNeighbors > 5 && tile.vegetation.density ++ //+= Math.floor(game.getHabitatDensity % tile.habitatNeighbors)=== 0) {
                tile.vegetation.density++
**/
/**
            } else if(tile.domesticity > 0) {
                tile.vegetation.density -= Math.floor(Math.random() * tile.domesticity) + 1
**/
/**            }
**/            
            
            if(tile.eventData && tile.eventData.rain && tile.eventData.rain.active) {
                var rain = tile.eventData.rain
                if(rain.power  + rain.age < 50) {
                    tile.vegetation.density += 3 + Math.floor(Math.random() * rain.power)
                } else {
                    tile.vegetation.desity--
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

game.addEntity = function(x,y){
    game.world[y][x].entity = new Entity()
    game.world[y][x].hunger = Math.floor(Math.random() * 100) + 1
}