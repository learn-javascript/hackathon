
window.app.renderer = (function () {
    var App = window.app
    var lastWorld = null
    var ctx = App.canvasContext
    ,   $canvas = App.$canvas
    ,   $container = App.$container
    function onresize () {
        $canvas.width = $container.offsetWidth
        $canvas.height = $container.offsetHeight
        if(lastWorld) render(lastWorld)
    }

    window.addEventListener('resize', onresize)
    onresize()
    //this name fucking sucks
    function calculateRender(length){
        var ret = {};
        var tileSize = ~~($canvas.height / length)
        var size = tileSize * length
        var topPadding = ~~($canvas.height/2 - size/2)
        var leftPadding = ~~($canvas.width/2 - size/2)
        ret.tileSize = tileSize;
        ret.size = size;
        ret.topPadding = topPadding;
        ret.leftPadding = leftPadding;
        return ret;
    }

    function render (world) {
        ctx.fillStyle ='white'
        ctx.fillRect(0, 0, $canvas.width, $canvas.height)

        lastWorld = world
        // this name also fucking sucks
        var tileRenderInfo = calculateRender(world.length);
        var length = world.length
          , tileSize = tileRenderInfo.tileSize
          , size = tileRenderInfo.size
          , topPadding = tileRenderInfo.topPadding
          , leftPadding = tileRenderInfo.leftPadding

        for(var i=0; i<length; i++) {
            for(var j=0; j<length; j++) {
                var tile = world[i][j]
                var density = tile.vegetation.density
                //console.log(density)

                //ctx.fillStyle = density<1 ? 'white' : 'hsl(' + (40 + density) + ', 100%, 50%)'
                ctx.fillStyle = getColor(density)
                //console.log(getColor(density))
                ctx.fillRect(j*tileSize+leftPadding, topPadding + i*tileSize, tileSize-1, tileSize-1)

                if(tile.entity) {
                    ctx.fillStyle = 'rgb(0, 0, 0)'
                    ctx.fillRect(j*tileSize+leftPadding + ~~(tileSize/4), topPadding + i*tileSize + ~~(tileSize/4), ~~(tileSize / 2), ~~(tileSize / 2))
                }

            }
        }
    }

    return {
        render: render,
        calculateRender : calculateRender
    }
    function getHungerColor(hunger){
        
    }
    function getColor(density){
        var ones = density % 10
        var tens = density / 10
        var hue = 150 - ( (Math.floor(tens)) * 6)
        hue = Math.floor( Math.max(90, hue) )
        var saturation = Math.floor( Math.max(45, 100 - (density * 0.3) ) )
        var lum = Math.floor( Math.max(30, 100 - (density * 0.45) ) )
        var hsl = 'hsl(' + hue +',' + saturation + '%,' + lum + '%)'
        //console.log(hsl)
        return hsl
    }

})()
