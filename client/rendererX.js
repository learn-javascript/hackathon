
window.app.renderer = (function () {

    var $container = document.querySelector('#canvas-area')
    $container.innerHTML = ''

    var WIDTH = $container.offsetWidth
    var HEIGHT = $container.offsetHeight
    var stage
    var tilemap

    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST
    stage = new PIXI.Stage(0xFFFFFF)
    renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT)

    function onresize () {
        WIDTH = $container.offsetWidth
        HEIGHT = $container.offsetHeight
        renderer.resize(WIDTH, HEIGHT)
    }
    onresize()
    window.addEventListener('resize', onresize)

    function createTilemap (world) {
        tilemap = new Tilemap(world)
        stage.addChild(tilemap)
        requestAnimFrame(animate)
    }

    $container.appendChild(renderer.view)

    function animate() {
        requestAnimFrame(animate)
        tilemap.loop()
        renderer.render(stage)
    }

    Tilemap.prototype = new PIXI.DisplayObjectContainer()
    Tilemap.prototype.constructor = Tilemap

    function Tilemap(world){
        PIXI.DisplayObjectContainer.call(this)
        this.interactive = true

        this.ticks = 1

        // cache
        this.tiles = {}
        this.clusters = {}

        this.world = [[]]
        this.size = 0
        this.tileSize = 4
        this.zoom = 6
        this.zoomRate = 1.05
        this.scale.x = this.scale.y = this.zoom

        this.clusterBreakpoint = 4

        this.selectedTileCoords = [0, 0]
        this.mousePressPoint = [0, 0]

        this.selectedTileOverlay = new PIXI.Graphics()
        this.mouseOverTileOverlay = new PIXI.Graphics()
        stage.addChild(this.selectedTileOverlay)
        stage.addChild(this.mouseOverTileOverlay)

        this.update(world)
        this.attachEvents()
    }

    Tilemap.prototype.attachEvents = function () {
        var self = this
        $container.addEventListener('mousewheel', onmousewheel)
        $container.addEventListener('DOMMouseScroll', onmousewheel)
        $container.addEventListener('onmousewheel', onmousewheel)

        function onmousewheel (e) {
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
            delta > 0 ? self.zoomIn() : self.zoomOut()
        }

        this.mousedown = this.touchstart = function(data) {
            this.dragging = true
            this.mousePressPoint[0] = data.getLocalPosition(this.parent).x - this.position.x
            this.mousePressPoint[1] = data.getLocalPosition(this.parent).y - this.position.y

            this.selectTile(
                ~~(this.mousePressPoint[0] / (this.tileSize * this.zoom)),
                ~~(this.mousePressPoint[1] / (this.tileSize * this.zoom))
            )
        }

        this.mouseup = this.mouseupoutside = this.touchend = this.touchendoutside = function(data) {
            this.dragging = false
        }

        this.mousemove = this.touchmove = function(data) {
            if(this.dragging){
                var position = data.getLocalPosition(this.parent)
                this.position.x = position.x - this.mousePressPoint[0]
                this.position.y = position.y - this.mousePressPoint[1]
                this.clampPosition()
            }
            else{
                var mouseOverPoint = [0, 0]
                mouseOverPoint[0] = data.getLocalPosition(this.parent).x - this.position.x
                mouseOverPoint[1] = data.getLocalPosition(this.parent).y - this.position.y
    
                this.hoverTile(
                    ~~(mouseOverPoint[0] / (this.tileSize * this.zoom)),
                    ~~(mouseOverPoint[1] / (this.tileSize * this.zoom))
                )
            }
        }
    }

    Tilemap.prototype.loop = function () {
        var self = this

        this.children.forEach(function (tile) {
            tile.visible = false
        })

        if(this.zoom < this.clusterBreakpoint) {
            this.clustersInViewPort().forEach(function (cluster) {
                cluster.visible = true
                if(self.ticks !== cluster.ticks) self.fillCluster(
                    cluster,
                    clusterAvg(cluster.clusterX*10, cluster.clusterY*10)
                )
            })
        }
        else {
            this.tilesInViewPort().forEach(function (tile) {
                if(self.world[tile.tileY] && self.world[tile.tileY][tile.tileX]) {
                    tile.visible = true
                    if(self.ticks !== tile.ticks) self.fillTile(
                        tile,
                        self.world[tile.tileY][tile.tileX].vegetation.density,
                        self.world[tile.tileY][tile.tileX].entity,
                        self.world[tile.tileY][tile.tileX].eventData
                    )
                }
            })
        }

        function clusterAvg (x, y) {
            var avg = 0
            for(var i=0; i<10; i++) {
                for(var j=0; j<10; j++) {
                    if(self.world[i+y] && self.world[y+j][i+x]) avg+=self.world[i+y][j+x].vegetation.density
                }
            }
            return avg / (10*10)
        }
    }

    Tilemap.prototype.update = function(world){
        this.world = world

        // `init`
        if(world.length !== this.size) {
            this.selectTile(~~(world.length/2), ~~(world.length/2))
            this.centerOnSelectedTile()
        }

        this.size = world.length
        this.ticks++

        //console.log(this.children.length)
    }

    Tilemap.prototype.getCluster = function(x, y) {
        return this.clusters[x+'.'+y] || this.addCluster(x, y)
    }

    Tilemap.prototype.addCluster = function(x, y) {
        var cluster = new PIXI.Graphics()
        cluster.clusterX = x
        cluster.clusterY = y
        this.clusters[x+'.'+y] = cluster
        this.addChild(cluster)
        return cluster
    }

    Tilemap.prototype.fillCluster = function(cluster, density) {

        cluster.ticks = this.ticks
        cluster.clear()
        cluster.beginFill(getColor(density))
        cluster.drawRect(
            (cluster.clusterX * this.tileSize * 10),
            (cluster.clusterY * this.tileSize * 10),
            (this.tileSize * 10),
            (this.tileSize * 10)
        )
        cluster.endFill()
    }

    Tilemap.prototype.getTile = function(x, y) {
        return this.tiles[x+'.'+y] || this.addTile(x, y)
    }

    Tilemap.prototype.addTile = function(x, y){
        var tile = new PIXI.Graphics()
        tile.tileX = x
        tile.tileY = y
        this.tiles[x+'.'+y] = tile
        this.addChild(tile)
        return tile
    }

    Tilemap.prototype.fillTile = function(tile, density, entity, eventData){
        tile.ticks = this.ticks
        tile.clear()

        tile.beginFill(getColor(density))
        tile.drawRect(
            (tile.tileX * this.tileSize),
            (tile.tileY * this.tileSize),
            (this.tileSize),
            (this.tileSize)
        )

        if(entity) {
            tile.beginFill(0x000000)
            tile.drawRect(
                tile.tileX * this.tileSize + (this.tileSize / 4),
                tile.tileY * this.tileSize + (this.tileSize / 4),
                this.tileSize/2,
                this.tileSize/2
            )
        }
        if(eventData.rain === true){
            tile.beginFill(0xFF0000)
            tile.drawRect(
                tile.tileX * this.tileSize + (this.tileSize / 4),
                tile.tileY * this.tileSize + (this.tileSize / 4),
                this.tileSize/2,
                this.tileSize/2
            )
        }

        tile.endFill()
    }

    Tilemap.prototype.tilesInViewPort = function(){

        // tile size in pixels
        var tileSizePx = this.tileSize * this.zoom

        // viewport width and height in tiles
        var horiz = clamp(Math.ceil(WIDTH / tileSizePx)+1, 0, this.size)
        var verti = clamp(Math.ceil(HEIGHT / tileSizePx)+1, 0, this.size)

        // top left corner tile coordinates of viewport
        var startingX = ~~Math.abs( clamp(this.position.x / tileSizePx, -this.size, 0))
        var startingY = ~~Math.abs( clamp(this.position.y / tileSizePx, -this.size, 0))

        var tiles = []

        for(var i=0; i < horiz; i++) {
            for(var j=0; j < verti; j++) {
                tiles.push(this.getTile(i + startingX, j + startingY))
            }
        }

        return tiles
    }

    Tilemap.prototype.clustersInViewPort = function() {

        // cluster size in pixels
        var clusterSizePx = this.tileSize * this.zoom * 10

        // viewport width and height in clusters
        var horiz = clamp(Math.ceil(WIDTH / clusterSizePx)+1, 0, this.size/10)
        var verti = clamp(Math.ceil(HEIGHT / clusterSizePx)+1, 0, this.size/10)

        // top left corner tile coordinates of viewport
        var startingX = ~~(Math.abs( clamp(this.position.x / clusterSizePx, (-this.size/10), 0)))
        var startingY = ~~(Math.abs( clamp(this.position.y / clusterSizePx, (-this.size/10), 0)))

        var clusters = []

        for(var i=0; i < horiz; i++) {
            for(var j=0; j < verti; j++) {
                clusters.push(this.getCluster(j + startingX, i + startingY))
            }
        }
        return clusters
    }

    Tilemap.prototype.hoverTile = function(x, y){

        this.mouseOverTileOverlay.clear()
        this.mouseOverTileOverlay.lineStyle(1, 0xEC28FF, 1)
        this.mouseOverTileOverlay.beginFill(0x000000, 0)
        this.mouseOverTileOverlay.drawRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize - 1,
            this.tileSize - 1
        )
        this.mouseOverTileOverlay.endFill()
        stage.addChild(this.mouseOverTileOverlay)
        this.mouseOverTileOverlay.scale = this.scale
        this.mouseOverTileOverlay.position = this.position
    }

    Tilemap.prototype.selectTile = function(x, y){

        if(window.Events) {
            Events.trigger('tileClick', this.world[y][x], x, y)
        }

        this.selectedTileCoords = [x, y]
        this.selectedTileOverlay.clear()
        this.selectedTileOverlay.lineStyle(1, 0xFF7F16, 1)
        this.selectedTileOverlay.beginFill(0x000000, 0)
        this.selectedTileOverlay.drawRect(
            this.selectedTileCoords[0] * this.tileSize,
            this.selectedTileCoords[1] * this.tileSize,
            this.tileSize - 1,
            this.tileSize - 1
        )
        this.selectedTileOverlay.endFill()
        stage.addChild(this.selectedTileOverlay)
        this.selectedTileOverlay.scale = this.scale
        this.selectedTileOverlay.position = this.position
    }

    Tilemap.prototype.zoomIn = function(){
        if(this.zoom >= this.clusterBreakpoint) {
            this.mouseOverTileOverlay.visible = true
            this.selectedTileOverlay.visible = true
        }

        this.zoom = Math.min(this.zoom * this.zoomRate, 50)
        this.scale.x = this.scale.y = this.zoom
        this.centerOnSelectedTile()
        this.clampPosition()
    }

    Tilemap.prototype.zoomOut = function (){
        this.mouseOverTileOverlay.clear()
        this.zoom = Math.max(this.zoom / this.zoomRate, 1)
        this.scale.x = this.scale.y = this.zoom
        this.centerOnSelectedTile()
        this.clampPosition()

        if(this.zoom < this.clusterBreakpoint) {
            this.mouseOverTileOverlay.visible = false
            this.selectedTileOverlay.visible = false
        }
    }

    Tilemap.prototype.centerOnSelectedTile = function(){
        this.position.x = WIDTH / 2 - this.selectedTileCoords[0] * this.zoom * this.tileSize - this.tileSize * this.zoom / 2
        this.position.y = HEIGHT / 2 - this.selectedTileCoords[1] * this.zoom * this.tileSize - this.tileSize * this.zoom / 2
    }


    Tilemap.prototype.clampPosition = function(){
        // this.position.x = Math.max(this.position.x, -1 * this.tileSize * this.size * this.zoom + WIDTH)
        // this.position.x = Math.min(this.position.x, 0)
        // this.position.y = Math.max(this.position.y, -1 * this.tileSize * this.size * this.zoom + HEIGHT)
        // this.position.y = Math.min(this.position.y, 0)
    }

    return {
        render: function (world) {
            if(tilemap) tilemap.update(world)
            else createTilemap(world)

            //tilemap.tilesInViewPort()
        },
        calculateRender: function () {
            
        }
    }
    
    // utils

    function clamp (num, min, max) {
        return Math.min(Math.max(num, min), max)
    }

    function getColor(density){
        var ones = density % 10
        var tens = density / 10
        var hue = 150 - ( (Math.floor(tens)) * 6)
        hue = Math.floor( Math.max(90, hue) )
        var saturation = Math.floor( Math.max(45, 100 - (density * 0.3) ) )
        var lum = Math.floor( Math.max(30, 100 - (density * 0.45) ) )
        var hsl = [hue/170, saturation/100, lum/100]
        return rbgToHex.apply(null, hslToRgb.apply(null, hsl))
    }

    function hslToRgb(h, s, l){
        var r, g, b;
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    function rbgToHex(r, b, g) {
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

})()