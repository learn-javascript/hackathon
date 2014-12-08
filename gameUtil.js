var _ = require('lodash')
module.exports = {
    forEach2d : function forEach2d (arr, cb) {
        for(var y = 0; y < arr.length; y++) {
            for(var x = 0; x < arr[y].length; x++) {
                cb(arr[y][x], x, y)
            }
        }
    },
    getNeighbors : function getNeighbors(arr, sx, sy){
        var neighbors = []
        for(var ny = Math.max(sy - 1, 0); ny <= Math.min(sy + 1, arr.length-1); ny++){
            for(var nx = Math.max(sx - 1, 0); nx <= Math.min(sx + 1, arr[0].length-1); nx++){
                if(nx != sx || ny != sy)
                    neighbors.push(arr[ny][nx])
            }
        }
        return neighbors
    },
    getNeighborsScale : function getNeighbors(arr, sx, sy, size){
        var neighbors = []
        for(var ny = Math.max(sy - size, 0); ny <= Math.min(sy + size, arr.length-1); ny++){
            for(var nx = Math.max(sx - size, 0); nx <= Math.min(sx + size, arr[0].length-1); nx++){
                if(nx != sx || ny != sy) neighbors.push(arr[ny][nx])
            }
        }
        return neighbors
    },
    create2dArray : function create2dArray(width, height){
        var ret = []
        for(var i = 0; i < height; i++){
            for(var j = 0; j < width; j++){
                ret.push([])
            }
        }
        return ret;
    
    },
    weightedRandom : function weightedRandom(weights){
        var totalWeight = weights.reduce(function(prev,cur){
            return prev + cur;
        });
        var rand = _.random(0,totalWeight);
        var weightSum = 0;
        for(var i = 0; i < weights.length; i++){
            weightSum += weights[i];
            weightSum = +weightSum;
            if(rand <= weightSum){
                return i;
            }
        }
    }
}