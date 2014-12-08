
;(function () {

    var socket = window.socket = window.io()
    var App = window.app;
    App.worldHistory = [];
    App.paused = false;
    getWorld();

    function getWorld(failCount){
        if(failCount > 4){
            console.log("whut")
            return
        }
        
        reqwest({
            url : 'http://104.236.45.77:3000/update',
            method : 'get',
            type : 'json',
            success : updateWorldQueue
        });
    }
    App.getWorld = getWorld

    function updateWorldQueue(data){
        App.worldHistory.push(data)
        App._latestWorld = data;
        Events.trigger('World:fetched')
        setTimeout(getWorld, 1000)
        if(!App.paused) renderWorld()
    }

    function renderWorld(world){
        // maybe some interpolation logic will go here
        var w;
        if(world) w = world
        else w = App._latestWorld
        App.renderer.render(w)
        App.world = w;
    }
    App.renderWorld = renderWorld

    Events.on('tileClick', function (tile, x, y) {
        console.log(x, y, tile)
        socket.emit('addEntity', {x: x, y: y})
    })

})()
