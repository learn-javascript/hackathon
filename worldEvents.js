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
    this.init()
    console.log(this.center)
}

RainEvent.prototype.tick = function(){
    return
    this.life--
    if(this.life > 0){
        if( Math.pow(Math.ceil(this.life * 0.90), 2) / 100 >= _.random(1,100)){
            this.createCloud()
            console.log("CLOUD")
        }
    }else{
        if(this.nodes.length > 0){
            this.nodes.pop()
        }else{
            console.log("DEAD")
            this.game.worldEvents.remove(this)
        }
    }
}

RainEvent.prototype.init = function(){
    this.life = _.random(40, 100)
    var startY = _.random(0, this.game.world.length-1)
    var startX = _.random(0, this.game.world[0].length-1)
    this.center = this.game.world[startY][startX]
    this.size = _.random(1, 3)
    this.nodes = GameUtil.getNeighborsScale(this.game.world, startX, startY, this.size)
    this.leftBound = Math.max(this.center.x - this.size, 0)
    this.topBound = Math.max(this.center.y - this.size, 0)
    this.rightBound = Math.max(this.center.x + this.size, this.game.world.length-1)
    this.bottomBound = Math.max(this.center.y + this.size, this.game.world.length-1)
    this.nodes.push(this.center)
    this.edgeNodes = this.nodes.slice()
}

RainEvent.prototype.createCloud = function(){
    console.log("MA CLOUD")
    var nodeInd = _.random(0, this.edgeNodes.length-1)
    var edgeNode = this.edgeNodes[nodeInd]
    var edges = this.getEdges(this.game.world, edgeNode)
    if(edges.length === 0){
        this.edgeNodes.splice(nodeInd, 1)
        return
    }
    console.log(edges)
    var selectedNode = edges[_.random(0, edges.length-1)]
    selectedNode.eventData.rain = {
        power : _.random(10, 100),
        active : true
    }
    // Check if selected node is an edge
    if(getEdges(selectedNode).length > 0) this.edgeNodes.push(selectedNode)
    if(edges.length === 1) this.edgeNodes.splice(nodeInd, 1)
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