(function(){
    var App = window.app = {}
    App.$container = document.querySelector('#canvas-area') 
    App.$canvas = document.createElement('canvas')
    App.canvasContext = App.$canvas.getContext('2d')
    App.world = [[]];
    App.$container.appendChild(App.$canvas)
    App.$canvas.addEventListener('click', function(e){
        if(e.target.tagName !== 'CANVAS') return
        var length = App.world.length
        var tileInfo = App.renderer.calculateRender(length);
        var normalizedX = e.clientX - tileInfo.leftPadding;
        var normalizedY = e.clientY - tileInfo.topPadding;
        normalizedX = Math.floor(normalizedX / tileInfo.tileSize);
        normalizedY = Math.floor(normalizedY / tileInfo.tileSize);
        if(normalizedX < 0 || normalizedX > length) return;
        if(normalizedY < 0 || normalizedY > length) return;
        Events.trigger('Canvas:tile:clicked', App.world[normalizedY][normalizedX], normalizedX, normalizedY-1);
    },false)
}())