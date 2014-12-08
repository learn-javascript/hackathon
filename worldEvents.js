var GameUtil = require('./gameUtil')
var _ = require('lodash')
function WorldEvents(game){
    this.game = game
    this._added = []
    this._removed = []
    this.activeEvents = []
}
module.exports.WorldEvents = WorldEvents
module.exports.RainEvent = RainEvent


WorldEvents.prototype.tick = function(){
    if(this.activeEvents.length > 0){
        var i = this.activeEvents.length-1
        while(i >= 0){
            this.activeEvents[i].tick()
            i--
        }
    }
    this._update()
}
WorldEvents.prototype._update = function(){
    var self = this
    this._added.forEach(function(e){
        self.activeEvents.push(e)
    })
    this._removed.forEach(function(e){
        var i = self.activeEvents.indexOf(e)
        if(i > -1) return self.activeEvents.splice(i,1)
    })
    this._added = []
    this._removed = []
}


WorldEvents.prototype.add = function(e){
    this._added.push(e)
}

WorldEvents.prototype.remove = function(e){
    this._removed.push(e)
}

function RainEvent(game){
    this.game = game
    this.age = 0
    this.init()
    console.log(this.center)
}

RainEvent.prototype.tick = function(){
    this.life-=20
    if(this.life > 0){
        if( Math.random() > 0.3){
            this.updateClouds()
            var cloudCount = _.random(0, 5)
            if(cloudCount > this.nonCloudNodes.length) cloudCount = this.nonCloudNodes.length
            while(cloudCount > 0){
                this.createCloud()
                cloudCount--
            }
        }else{
            this.nonCloudNodes.pop()
        }
    }else{
        if(this.cloudNodes.length > 0){
            this.cloudNodes.pop()
        }else{
            console.log("DEAD")
            this.game.worldEvents.remove(this)
        }
    }
}

RainEvent.prototype.init = function(){
    this.life = _.random(15, 45)
    var startY = _.random(0, this.game.world.length-1)
    var startX = _.random(0, this.game.world[0].length-1)
    this.center = this.game.world[startY][startX]
    this.size = _.random(2, 10)
    this.nonCloudNodes = GameUtil.getNeighborsScale(this.game.world, startX, startY, this.size)
    this.nonCloudNodes = _.shuffle(this.nonCloudNodes)
    this.cloudNodes = []
    this.life += (this.size * 8) * 0.25
    this.life = ~~this.life
}
RainEvent.prototype.updateClouds = function(){
    var self = this
    this.cloudNodes.forEach(function(cn){
        cn.eventData.rain.age++
        self.totalAge++
    })
}


RainEvent.prototype.createCloud = function(){
    if(this.nonCloudNodes.length === 0) return
    var c = this.nonCloudNodes.pop()
    c.eventData.rain.active = true
    c.eventData.rain.power = _.random(10,50)
    this.cloudNodes.push(c)
}
//undefined/null nodes edges as far as we are concerned
//tiles with a rain id not ours is also an edge
RainEvent.prototype.getEdges = function(arr, node){
    var edges = []
    //check left node
    if(node && this.emptyNode(arr[node.y][node.x-1]) ){
        edges.push([node.y][node.x-1])
    }
    //check right
    if(node && this.emptyNode(arr[node.y][node.x+1]) ){
        edges.push([node.y][node.x+1])
    }
    //check up
    if(node && this.emptyNode(arr[node.y-1][node.x]) ){
        edges.push([node.y-1][node.x])
    }
    //check down
    if(node && this.emptyNode(arr[node.y+1][node.x]) ){
        edges.push([node.y+1][node.x])
    }
    console.log(edges)
    return edges
}

RainEvent.prototype.emptyNode = function(node){
    if(!node) return false
    if(node.eventData.rain.active) return false
    if(node.x > this.rightBound || node.x < this.leftBound ) return false
    if(node.y > this.bottomBound || node.y < this.topBound) return false
    return true
}

RainEvent.prototype.selectNextTile = function(){
    var t = _.random(0, this.edgeNodes)
}
/*
function* createSpiral(arr, sx, sy){
        // (di, dj) is a vector - direction in which we move right now
    var di = 1;
    var dj = 0;
    // length of current segment
    var segment_length = 1;

    // current position (i, j) and how much of current segment we passed
    var i = sx;
    var j = sy;
    var segment_passed = 0;
    var coords = [0,0]
    for (var k = 0; k < arr.length * arr.length; ++k) {
        // make a step, add 'direction' vector (di, dj) to current position (i, j)
        i += di;
        j += dj;
        coords[0] = i
        coords[1] = j
        ++segment_passed;
        if (segment_passed == segment_length) {
            // done with current segment
            segment_passed = 0;

            // 'rotate' directions
            var buffer = di;
            di = -dj;
            dj = buffer;

            // increase segment length if necessary
            if (dj === 0) {
                ++segment_length;
            }
        }
        yield coords
    }
}
*/