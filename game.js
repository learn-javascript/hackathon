
var world = require('./world')
var genWorld = require('./genWorld')

var game = {}

module.exports = {
    tick: tick,
    action: action
}

// init world
game.world = genWorld(20, 20)
world.set(game.world)

function tick (done) {

    game.world = world.clone()

    game.tick()

    // done doing things
    world.set(game.world)
    done()
}

function action (action) {
    //to-do
}
function create2dArray(width, height){
    var ret = []
    for(var i = 0; i < height; i++){
        for(var j = 0; j < width; j++){
            ret.push([]);
        }
    }
    return ret;

}
function cacheNeighbors(){
    var neighborCache = create2dArray(20,20);
    forEach2d(game.world, function(tile, x , y){
        neighborCache[y][x] = getNeighbors(game.world,x,y);
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
                if(t.entity.alive) {
                    tile.livingNeighbors++
                }
                if(t.vegetation.density > 0) {
                    tile.habitatNeighbors++
                }
            });

            if(tile.vegetation.density < tile.entity.hunger) {
                tile.entity.alive = false
                tile.domesticity = 0
/**
 * all of this is getting replaced with hunger data!
 * let the hunger games begin!
 */
            } else if(tile.livingNeighbors < 2) {
                tile.entity.alive = false
                tile.entity.hunger = 0
                tile.domesticity = 0
            } else if(tile.livingNeighbors == 3) {
                tile.entity.alive = true
//                tile.entity.hunger = Math.round(game.neighbors[y][x].reduce(function(p,c,i,arr) {
//                    if(p.entity.alive) {
//                      return p + c.entity.hunger
//                    } else {
//                      return p
//                    }
//                tile.entity.hunger = Math.round(Math.random() * 100) + 1
//                },0) / game.livingNeighbors)
                tile.entity.hunger = 1
            } else if(tile.livingNeighbors > 3) {
                tile.entity.alive = false
                tile.entity.hunger = 0
                tile.domesticity = 0
            }
            
            if(tile.entity.alive) {
                tile.domesticity++
//                tile.vegetation.density -= (Math.random() * tile.entity.hunger) + 1 
                tile.vegetation.density -= (Math.random() * tile.domesticity) + 1 
            } else if(tile.vegetation.habitatNeighbors > 5 && tile.vegetation.density > game.getHabitatDensity(y,x)) {
                tile.vegetation.density -= game.getHabitatDensity % tile.habitatNeighbors
            } else if(tile.vegetation.habitatNeighbors > 5 && tile.vegetation.density < game.getHabitatDensity(y,x)) {
                tile.vegetation.density += game.getHabitatDensity % tile.habitatNeighbors
            } else {
                tile.vegetation.density += tile.habitatNeighbors
            }
            
            tile.vegetation.density = (Math.random() * 10) + tile.vegetation.density - 5
            tile.vegetation.density = tile.vegetation.density > 100 ? 100 : tile.vegetation.density
            tile.vegetation.density = tile.vegetation.density < 0 ? 0 : tile.vegetation.density
/**            
            //uncomment this if for more volatile habitats
            if(tile.vegetation.density === 0 && game.getHabitatDensity(y,x) % tile.habitatNeighbors > 1) {
                tile.vegetation.density++
            } else if(tile.vegetation.density > 0 && tile.habitatNeighbors <= 3) {
                tile.vegetation.density++               
            } else if(tile.habitatNeighbors == 4 || tile.habitatNeighbors == 5) {
                tile.vegetation.density = game.getHabitatDensity(y,x) > 0 ? 1 : game.getHabitatDensity(y,x)
            } else if(tile.vegetation.density > game.getHabitatDensity(y,x) && tile.habitatNeighbors > 5) {
                tile.vegetation.density--
            } else if(tile.vegetation.density < game.getHabitatDensity(y,x) && tile.habitatNeighbors > 5) {
                tile.vegetation.density++
            }
**/
        }
    }
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

function getNeighbors(arr, sx, sy){
    var neighbors = []
    for(var ny = Math.max(sy - 1, 0); ny <= Math.min(sy + 1, arr.length-1); ny++){
        for(var nx = Math.max(sx - 1, 0); nx <= Math.min(sx + 1, arr[0].length-1); nx++){
            if(nx != sx || ny != sy)
                neighbors.push(arr[ny][nx])
        }
    }
    return neighbors
}

// to-do: test
function adjacent (arr, x, y, cb) {
    for(var yIter = y - 1; yIter <= y + 1; yIter++) {
        for(var xIter = x - 1; xIter <= x + 1; xIter++) {
            cb(arr[yIter][xIter], xIter, yIter)
        }
    }
}

// util
function forEach2d (arr, cb) {
    for(var y = 0; y < arr.length; y++) {
        for(var x = 0; x < arr[y].length; x++) {
            cb(arr[y][x], x, y)
        }
    }
}